import React, { useState } from 'react';
import { ZoneId, ZonedDateTime, DateTimeFormatter, ChronoUnit } from '@js-joda/core';
import { Locale } from '@js-joda/locale_en-us';
import { faBorderAll } from '@fortawesome/free-solid-svg-icons';
import { faChartBar } from '@fortawesome/free-regular-svg-icons';
import { MockTypes } from '../mock-data';
import IconButton from '../IconButton';
import OnSiteActivityMultiChart, { OnSiteActivity } from './OnSiteActivityMultiChart';

interface OnSiteActivityWidgetProps {
    job?: MockTypes.ProviderJob,
}

interface OnSiteActivityTableProps {
    sortedActivities: OnSiteActivity[],
}

const TABLE_FORMATTER = DateTimeFormatter.ofPattern("MM/dd/YYYY hh:mm a").withLocale(Locale.US);

const sortActivities = (job: MockTypes.ProviderJob): OnSiteActivity[] => job.onSiteActivity
    ? job.onSiteActivity
        .map(activity => ({
            ...activity,
            checkIn: ZonedDateTime.parse(activity.checkInUtc).withZoneSameInstant(ZoneId.of(job.propertyTimeZone)),
            checkOut: ZonedDateTime.parse(activity.checkOutUtc).withZoneSameInstant(ZoneId.of(job.propertyTimeZone)),
        }))
        .sort((a, b) => a.checkIn.compareTo(b.checkIn))
    : [];


const calcHours = (checkIn: ZonedDateTime, checkOut: ZonedDateTime) => checkIn.until(checkOut, ChronoUnit.MINUTES) / 60.0;

const OnSiteActivityTable = ({ sortedActivities }: OnSiteActivityTableProps) => {
    return <div className="on-site-activity-table grid grid-cols-5 shadow mt-2">
        <div className="header col-span-2">Check in</div>
        <div className="header col-span-2">Check out</div>
        <div className="header col-span-1 text-right">Hours</div>
        { sortedActivities.map(activity => ([
            <div className="col-span-2">{ activity.checkIn.format(TABLE_FORMATTER) }</div>,
            <div className="col-span-2">{ activity.checkOut.format(TABLE_FORMATTER) }</div>,
            <div className="col-span-1 text-right">{ calcHours(activity.checkIn, activity.checkOut).toFixed(2) }</div>,
        ]))}
        <div className="col-span-5 text-right font-bold">
            { sortedActivities.reduce(
                    (sum, activity) => { return sum + calcHours(activity.checkIn, activity.checkOut); },
                    0
                ).toFixed(2)
            }
        </div>
    </div>;
};

const OnSiteActivityWidget = ({ job }: OnSiteActivityWidgetProps) => {
    
    if (!job)
        return null;

    const sortedActivities = sortActivities(job);

    const [isChartVisible, setIsChartVisible] = useState(true);
    
    return <>
        { sortedActivities.length > 0 &&
            <>
                <div className="w-full text-base font-semibold pt-8 flex content-center">
                    On-site Activity
                    <IconButton
                        className="ml-4"
                        icon={faChartBar}
                        onClick={() => setIsChartVisible(true)}
                        color={isChartVisible ? 'blue' : 'darkgray'}
                    />
                    <IconButton
                        className="ml-4"
                        icon={faBorderAll}
                        onClick={() => setIsChartVisible(false)}
                        color={!isChartVisible ? 'blue' : 'darkgray'}
                    />
                </div>
                { isChartVisible
                    ? <OnSiteActivityMultiChart activities={sortedActivities} timeZone={job.propertyTimeZone} />
                    : <OnSiteActivityTable sortedActivities={sortedActivities}/>
                }
            </>
        }
    </>
};

export default OnSiteActivityWidget;