import React, { useContext, useState } from 'react';
import { ZonedDateTime, ChronoUnit, Duration, Temporal, ZoneId, Instant } from '@js-joda/core';
import '@js-joda/timezone'
import { TimeRange, earliestOf, formatter, truncateTimeZone, utcTimestampToInstant } from '@dmg/core/src/time';
import { Timestamp } from '@dmg/core/src/protocolTypes';
import { MockTypes } from '../mock-data';
import { ACTIVITY_TYPES } from '../Enum';
import useWidth from '../useWidth';
import FloatAffixed from '../FloatAffixed';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareFull } from '@fortawesome/free-solid-svg-icons';

export type ChartData = { [key: string]: OnSiteActivity[] };

export interface OnSiteActivity extends MockTypes.OnSiteActivity {
    checkIn: ZonedDateTime,
    checkOut: ZonedDateTime,
}

interface InstantTimeRange {
    start: Instant,
    end: Instant,
}

interface OnSiteActivityMultiChartProps {
    activities: OnSiteActivity[],
    timeZone?: string,
}

interface OnSiteActivityChartProps {
    data: ChartData,
    duration?: number,
    timeZone?: string,
}

interface OnSiteActivityChartRowProps {
    techName: string,
    activities: OnSiteActivity[],
}

interface LaborTypeBarSectionProps {
    laborType: MockTypes.LaborType,
    activityDuration: number,
    isFirst?: boolean,
    isLast?: boolean,
}

interface OnSiteActivityBarProps {
    activity: OnSiteActivity,
}

interface WithAxisProps {}

interface ChartContext {
    timeRange?: TimeRange,
    duration?: number,
    timeZone?: string,
}

interface AxisContext {
    axisStartTime?: Instant,
    axisStartOffset?: number,
    axisDuration?: number,
    axisWidth?: number,
}

const MIN_CHART_GAP = 1 // Activities more than 1 hour than the previous known activity check out will be separated to a new chart
const MIN_DATE = ZonedDateTime.now().minusYears(3).toInstant();
const MAX_DATE = ZonedDateTime.now().plusYears(3).toInstant();
const AXIS_LABEL_BUFFER = .025; //Percentage of chart timerange (defined as between first check-in and last check-out), divided by 100
const AXIS_LABEL_WIDTH = 64.0; //px
const HALF_LABEL_WIDTH = AXIS_LABEL_WIDTH / 2; //px
const DAY_FORMATTER = formatter("EEE M/d");
const TIME_FORMATTER = formatter("h:mm a");
const DATE_TIME_FORMATTER = formatter(" EEE M/d h:mm a zzzz");
const TIMEZONE_FORMATTER = formatter("zzzz");
const CHART_MIN_DURATION = Duration.ofMinutes(15);

const LABEL_INTERVALS: { [key: string]: Duration } = {
    1: Duration.ofMinutes(1),
    5: Duration.ofMinutes(5),
    15: Duration.ofMinutes(15),
    30: Duration.ofMinutes(30),
    60: Duration.ofHours(1),
    360: Duration.ofHours(6),
    720: Duration.ofHours(12),
    1440: Duration.ofDays(1),
};

const ChartContext = React.createContext<ChartContext>({});
const AxisContext = React.createContext<AxisContext>({});

const mapActivitiesToChartData = (activities: OnSiteActivity[]): ChartData[] => {

    const chartBuckets: OnSiteActivity[][] = [];
    let latestActivity: OnSiteActivity;
    let chartNum = 0;
    activities.forEach(activity => {
        if (latestActivity && latestActivity.checkOut.until(activity.checkIn, ChronoUnit.HOURS) >= MIN_CHART_GAP)
            chartNum++;
        if (!(chartNum in chartBuckets))
            chartBuckets[chartNum] = [];
        chartBuckets[chartNum].push(activity);
        if (!latestActivity || activity.checkOut.compareTo(latestActivity.checkOut) > 0)
            latestActivity = activity;
    });

    const allChartData = chartBuckets.map(chartActivities => 
        chartActivities
            .reduce<ChartData>(
                (chartData, activity) => {
                    const techName = activity.technicianName;
                    const activities = chartData[techName] || [];
                    activities.push(activity);
                    chartData[techName] = activities;
                    return chartData;
                },
                {}
            )
    );
    return allChartData;
};

const getMultiChartTimeRange = (chartData: ChartData): InstantTimeRange|undefined => {
    if (Object.keys(chartData).length > 0) {
        const multiChartTimeRange: InstantTimeRange = { start: MAX_DATE, end: MIN_DATE };
        Object.keys(chartData)
            .flatMap(techName => chartData[techName].flatMap(activity => activity.laborTypes))
            .map<InstantTimeRange>(laborType => ({
                start: utcTimestampToInstant(laborType.start),
                end: utcTimestampToInstant(laborType.end)
            }))
            .forEach(timeRange => {
            if (timeRange.start.compareTo(multiChartTimeRange.start) < 0)
                multiChartTimeRange.start = timeRange.start;
            if (timeRange.end.compareTo(multiChartTimeRange.end) > 0)
                multiChartTimeRange.end = timeRange.end;
        });
        if (Duration.between(multiChartTimeRange.start, multiChartTimeRange.end).compareTo(CHART_MIN_DURATION) < 0) {
            multiChartTimeRange.end = multiChartTimeRange.start.plus(CHART_MIN_DURATION);
        }
        return multiChartTimeRange;
    } else
        return undefined;
};

const getSingleChartTimeRange = (chartData: ChartData, duration?: number): InstantTimeRange|undefined => {

    if (duration) {
        const instants = Object.keys(chartData)
            .flatMap<Timestamp>(techName => chartData[techName].flatMap<Timestamp>(activity => 
                activity.laborTypes.map<Timestamp>(laborType => laborType.start)
                    .concat(activity.laborTypes.map<Timestamp>(laborType => laborType.end))
            ))
            .map(timestamp => utcTimestampToInstant(timestamp));
        //const buffer = duration * TIME_RANGE_BUFFER;
        const earliest = earliestOf(instants);
        return {
            start: earliest ? earliest : MIN_DATE,
            end: earliest ? earliest.plusMillis(duration) : MAX_DATE,
            // end: earliest ? earliest.plusMillis(duration).plusMillis(buffer) : MAX_DATE,
        };
    } else
        return undefined;
};

const getLaborTypeColor = (eventType: ACTIVITY_TYPES) => {
    switch(eventType) {
        case ACTIVITY_TYPES.REGULAR:
            return 'bg-blue';
        case ACTIVITY_TYPES.HELPER:
            return 'bg-lightblue'
        case ACTIVITY_TYPES.UNAPPROVED:
        default:
            return 'bg-orange';
    }
};

const durationToPercentage = (start: Temporal, end: Temporal, overallDuration: number) => {
    const duration = Duration.between(start, end).toMillis();
    const percent = parseFloat(((duration / overallDuration) * 100.0).toFixed(2));
    return isNaN(percent) ? 0 : percent;
};

const getLabelInterval = (duration: Duration, maxLabels: number): Duration|undefined  => {
    let labelInterval: Duration | undefined = undefined;
    Object.keys(LABEL_INTERVALS).forEach(interval => {
        if (labelInterval === undefined && Math.floor(duration.toMinutes() / parseInt(interval)) <= maxLabels)
            labelInterval = LABEL_INTERVALS[interval];
    });
    return labelInterval;
};

const getAxisStartTime = (start: Instant, labelInterval: Duration): Instant => {
    const zonedStart = ZonedDateTime.ofInstant(start, ZoneId.UTC);
    let axisStart: Instant|undefined;
    if (labelInterval.toHours() < 1 && labelInterval.toMinutes() < 15) {
        const startSeconds = zonedStart.hour() * 3600 + zonedStart.minute() * 60 + zonedStart.second();
        let addSeconds = 0;
        while ((startSeconds + addSeconds) % labelInterval.seconds() !== 0) {
            addSeconds++;
        }
        axisStart = start.plus(Duration.ofSeconds(addSeconds));
    } else { // If labels are at least 15 minutes apart, don't bother with seconds - this shortcut makes the calculation faster
        const startMinutes = zonedStart.hour() * 60 + zonedStart.minute();
        let addMinutes = 0;
        while ((startMinutes + addMinutes) % labelInterval.toMinutes() !== 0) {
            addMinutes++;
        }
        axisStart = start.plus(Duration.ofMinutes(addMinutes));
    }

    if (start.isBefore(axisStart))
        axisStart = axisStart.minus(labelInterval);

    return axisStart;
}

const instantToZonedDateTime = (instant: Instant, timeZone: string) =>
    ZonedDateTime
    .ofInstant(instant, ZoneId.UTC)
    .withZoneSameInstant(ZoneId.of(timeZone));

const LaborTypeBarSection = (props: LaborTypeBarSectionProps) => {
    const { laborType, isFirst, isLast, activityDuration } = props;
    const [ popupIsOpen, setPopupIsOpen ] = useState<boolean>(false);
    const { timeZone = 'UTC' } = useContext(ChartContext);

    const leftRounded = isFirst ? 'rounded-l' : '';
    const rightRounded = isLast ? 'rounded-r' : '';
    const color = getLaborTypeColor(laborType.type);
    const start = utcTimestampToInstant(laborType.start);
    const end = utcTimestampToInstant(laborType.end);
    const laborTypeWidth = durationToPercentage(
        start,
        end,
        activityDuration
    );
    return <div
        className={`h-6 ${color} ${leftRounded} ${rightRounded}`}
        style={{
            width: `${laborTypeWidth}%`,
        }}
        onMouseOver={() => setPopupIsOpen(true)}
        onMouseOut={() => setPopupIsOpen(false)}
        onClick={() => setPopupIsOpen(!popupIsOpen)}
    >
        { popupIsOpen && 
            <FloatAffixed
                defaultEdge="over"
                edges={["over", "under"]}
                align="center" 
                className="bg-popupBackground text-popupText text-xs text-center shadow p-3 whitespace-pre-line"  
                bridge="arrow"
                bridgeStyle={{
                    fill: '#BBDEF0',
                }}
                bridgeOutlineStyle={{
                    fill: '#BBDEF0',
                }}
            >
                {truncateTimeZone(instantToZonedDateTime(start, timeZone).format(DATE_TIME_FORMATTER))}
                to
                {truncateTimeZone(instantToZonedDateTime(end, timeZone).format(DATE_TIME_FORMATTER))}
            </FloatAffixed>
        }
    </div>;
};

const OnSiteActivityBar = ({ activity }: OnSiteActivityBarProps) => {
    const { timeRange, duration } = useContext(ChartContext);
    const { axisStartTime, axisStartOffset, axisDuration, axisWidth } = useContext(AxisContext);
    const laborTypes = Array.from(activity.laborTypes.values()); //Throw away any custom array keys so 0..length-1 can be assumed

    if(!timeRange || !duration || !axisStartTime || !axisStartOffset || !axisDuration  || !axisWidth)
        return null;
    else {
        const activityDuration = Duration.between(activity.checkIn, activity.checkOut).toMillis();
        // const activityWidth = durationToPercentage(activity.checkIn, activity.checkOut, axisDuration);
        const activityWidth = axisWidth * (activityDuration / axisDuration);
        // const left = durationToPercentage(axisStart, activity.checkIn, duration) + (TIME_RANGE_BUFFER * 100);
        const left = axisStartOffset + (axisWidth * (Duration.between(axisStartTime, activity.checkIn).toMillis() / axisDuration));
        return <div
            className="flex absolute"
            style={{
                width: `${activityWidth}px`,
                left: `${left}px`,
            }}
        >
            { laborTypes.map((laborType, i) => 
                <LaborTypeBarSection
                    key={`laborType-${laborType.id}`}
                    laborType={laborType}
                    isFirst={i === 0}
                    isLast={i === laborTypes.length - 1 }
                    activityDuration={activityDuration}
                />
            ) }
        </div>;
    }
};

const OnSiteActivityChartRow = ({ techName, activities }: OnSiteActivityChartRowProps) => {
    return <>
        <div className="col-span-1 flex items-center text-xs text-darkgray border-r">{ techName }</div>
        <div className="col-span-9 border-r w-full h-10 relative">
            { Array.from(activities.values()).map(activity =>
                <OnSiteActivityBar key={`activity-${activity.id}`} activity={activity} />
            )}
        </div>
    </>;
};

const WithAxis = ({ children }: React.PropsWithChildren<WithAxisProps>) => {
    const { timeRange, duration, timeZone = 'UTC' } = useContext(ChartContext);
    const [ width, ref ] = useWidth<HTMLDivElement>();
    const axisContext: AxisContext = {};

    const labels = [];
    if (ref && ref.current && duration && timeRange && width) {
        const bufferInPx = Math.round(width * AXIS_LABEL_BUFFER);
        const axisWidth = width - bufferInPx; //Start after the left buffer
        const maxNumOfLabels = Math.floor(axisWidth / AXIS_LABEL_WIDTH);
        const d = Duration.ofMillis(duration);
        const labelInterval = getLabelInterval(d, maxNumOfLabels);
        if (!labelInterval) { //Just show time range start and end, if no interval was calculated
            labels.push({
                date: instantToZonedDateTime(timeRange.start, timeZone).format(DAY_FORMATTER),
                time: instantToZonedDateTime(timeRange.start, timeZone).format(TIME_FORMATTER),
                offset: bufferInPx - HALF_LABEL_WIDTH,
                timeZone: instantToZonedDateTime(timeRange.start, timeZone).format(TIMEZONE_FORMATTER)
            });
            labels.push({
                date: instantToZonedDateTime(timeRange.end, timeZone).format(DAY_FORMATTER),
                time: instantToZonedDateTime(timeRange.end, timeZone).format(TIME_FORMATTER),
                offset: axisWidth - bufferInPx,
                timeZone: instantToZonedDateTime(timeRange.end, timeZone).format(TIMEZONE_FORMATTER)
            });
            axisContext.axisStartTime = timeRange.start;  
            axisContext.axisDuration = duration;
            axisContext.axisWidth = axisWidth - bufferInPx;
        } else {
            const axisStart = getAxisStartTime(timeRange.start, labelInterval);
            const axisDuration = Duration.between(axisStart, timeRange.end).toMillis();
            const initialOffset = bufferInPx - HALF_LABEL_WIDTH;
            const numOfLabels = Math.ceil(axisDuration / labelInterval.toMillis()) + 1;
            const offsetInterval = axisWidth / (numOfLabels - 1);
            let tickCount = 0;
            let offset = initialOffset;
            let prevDate;
            let tick = axisStart;
            while (
                tickCount < numOfLabels
                // && tick.compareTo(timeRangeEnd) <= 0
                // && (offset + HALF_LABEL_WIDTH) <= width
                // && (tickCount-1)*AXIS_LABEL_WIDTH <= axisWidth
            ) {
                const zonedTick = instantToZonedDateTime(tick, timeZone);
                labels.push({
                    date: prevDate !== zonedTick.format(DAY_FORMATTER) ? zonedTick.format(DAY_FORMATTER) : '',
                    time: zonedTick.format(TIME_FORMATTER),
                    offset,
                    timeZone: zonedTick.format(TIMEZONE_FORMATTER),
                });
                tickCount++;
                offset = bufferInPx + (tickCount * offsetInterval) - HALF_LABEL_WIDTH;
                prevDate = zonedTick.format(DAY_FORMATTER);
                tick = tick.plus(labelInterval);
            }
            axisContext.axisStartTime = axisStart;
            axisContext.axisDuration = Duration.between(axisStart, tick.minus(labelInterval)).toMillis();
            axisContext.axisWidth = axisWidth;
        }
        axisContext.axisStartOffset = bufferInPx;
    }

    return <>
        <AxisContext.Provider value={axisContext}>
            { children }
        </AxisContext.Provider>  
        <div className="col-span-1"></div>
        <div ref={ref} className="axis col-span-9 flex relative">
            { labels.map((label, i) =>
                <div
                    key={`axis-label-${i}`}
                    className="w-16 text-xs text-darkgray absolute flex flex-col justify-start items-center"
                    style={{ left: `${label.offset}px` }}
                >
                    <div className="border-l border-lightgray h-4 w-0"></div>
                    <div>{ label.time }</div>
                    <div>{ truncateTimeZone(label.timeZone) }</div>
                    <div className="text-black font-bold">{ label.date }</div>
                </div>
            )}
        </div>
    </>;
};

const OnSiteActivityChart = ({ data, duration, timeZone }: OnSiteActivityChartProps) => {
    const timeRange = getSingleChartTimeRange(data, duration);

    if (!timeRange)
        return null;
    else {
        const context: ChartContext = {
            timeRange,
            duration: Duration.between(timeRange.start, timeRange.end).toMillis(),
            timeZone
        };
        return <ChartContext.Provider value={context}>
            <div className="grid grid-cols-10 mb-20 on-site-activity-chart">
                <WithAxis>
                    <>
                        { Object.keys(data).map(techName =>
                            <OnSiteActivityChartRow key={`chart-row-${techName}`} techName={techName} activities={data[techName]}/>
                        )}
                    </>
                </WithAxis>
            </div>
        </ChartContext.Provider>;
    }
};

const OnSiteActivityMultiChart = ({ activities, timeZone }: OnSiteActivityMultiChartProps) => {
    const allChartData = mapActivitiesToChartData(activities);
    const duration = allChartData
        .map(chartData => getMultiChartTimeRange(chartData))
        .filter((timeRange): timeRange is TimeRange => typeof timeRange !== undefined)
        .map(timeRange => Duration.between(timeRange.start, timeRange.end).toMillis())
        .sort((a,b) => b - a) // Sort largest to shortest
        .shift(); //Get longest time duration, to apply to all charts
    
    return <>
        <div className="text-left pt-2 pb-2 text-xs">
            <FontAwesomeIcon icon={faSquareFull} className="text-blue mr-2"/>Normal
            <FontAwesomeIcon icon={faSquareFull} className="text-lightblue mr-2 ml-6"/>Helper
            <FontAwesomeIcon icon={faSquareFull} className="text-orange mr-2 ml-6"/>Unapproved
        </div>
        { allChartData.map((chartData, i) =>
            <OnSiteActivityChart key={`chart-${i}`} data={chartData} duration={duration} timeZone={timeZone} />
        )}
    </>;
};

export default OnSiteActivityMultiChart;