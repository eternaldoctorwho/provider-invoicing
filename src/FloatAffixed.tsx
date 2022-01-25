import React, {ReactNode, CSSProperties, useState, useRef, useEffect} from "react";
import classNames from "classnames";
import ReactDOM from "react-dom";

interface EdgeFactor {
    v: -1 | 0 | 1,
    h: -1 | 0 | 1,
    parallel: (rect: Rect) => Bounds,
    perpendicular: (rect: Rect) => Bounds,
}

type EdgeName = "over" | "under" | "left" | "right"
type BridgePropFunction = (anchorRect: Rect, popupRect: Rect, translation: Vec2) => {
    transform: string,
    height: number,
    width: number,
    bottom?: number,
    left?: number,
}

type Alignment = "center"

type FitsFunction = (arect: Rect, psize: Vec2, viewportSize: Vec2) => boolean;
type TranslateFunction = (arect: Rect, prect: Rect, gap: number, viewportSize: Vec2) => Vec2;

class Rect {
    left: number;
    top: number;
    width: number;
    height: number;
    constructor(left: number, top: number, width: number, height: number) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }
    get min(): Vec2 {
        return new Vec2(this.left, this.top)
    }
    get max(): Vec2 {
        return new Vec2(this.left + this.width, this.top + this.height)
    }
    get x(): number { return this.left; }
    get y(): number { return this.top; }
    getSize(): Vec2 {
        return new Vec2(this.width, this.height);
    }
}

class Vec2 {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    clone = ()=> new Vec2(this.x, this.y);
    add = (a: Vec2)=> new Vec2(this.x + a.x, this.y + a.y);
}

type Bounds = {
    min: number,
    max: number,
}

// get Rect of element in viewport coordinates
function elementRectInViewport(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    return new Rect(rect.left, rect.top, rect.width, rect.height);
}

// represents a scheme for attaching a popup rect to an anchor rect
class AttachScheme {
    name: SchemeName;
    fits: FitsFunction;
    calcTranslation: TranslateFunction;
    constructor(name: EdgeName, args: {fits: FitsFunction, calcTranslation: TranslateFunction}) {
        const {fits, calcTranslation} = args;
        this.name = name;
        this.fits = fits;
        this.calcTranslation = calcTranslation;
    }
}
type SchemeName = EdgeName

type Schemes = { [key: string]: AttachScheme };

type StylesMap = { [key: string]: object };
type Styles = { [key: string]: string|number|object|undefined };

// given an anchor edge and a popup edge
// return the delta necessary to align the popup edge on the anchor edge
function align(anchorEdge: number, popupEdge: number) {
    return anchorEdge - popupEdge;
}

// given an anchor bounds and popup bounds and available space,
// return the delta required to align the popup bounds to anchor bounds according to which side has the most available space
function edgeAlignMaxSpace(anchorMin: number, anchorMax: number, popupMin: number, popupMax: number, space: number) {
    let rspace = space - anchorMax;
    let lspace = anchorMin;
    return (rspace <= lspace) ? anchorMax - popupMax : anchorMin - popupMin;
}

// given a delta, popup bounds, and available space
// return a new delta which keeps the popup bounds within the available space
function clampDelta(delta: number, popupMin: number, popupMax: number, space: number) {
    const edgemax = popupMax + delta;
    const edgemin = popupMin + delta;
    // nudge back into viewport if any edges fall out of bounds
    if (edgemin < 0)
        return delta - edgemin;
    else if (edgemax > space)
        return delta + (space - edgemax);
    return delta;
}

function clamp(value: number, pmin: number, pmax: number) {
    return value < pmin ? pmin : (value > pmax ? pmax : value);
}

function center_y(rect: Rect) {
    return (rect.min.y + rect.max.y) * 0.5;
}

function center_x(rect: Rect) {
    return (rect.min.x + rect.max.x) * 0.5;
}

function translateRect(rect: Rect, translation: Vec2) {
    if (!rect || !translation) return rect;
    return new Rect(rect.x + translation.x, rect.y + translation.y, rect.width, rect.height);
}

const edgeSchemes: Schemes = {
    "over": new AttachScheme('over', {
        fits: (anchorRect, popupSize, viewportSize) => popupSize.y <= Math.min(anchorRect.min.y, viewportSize.y),
        calcTranslation: (anchorRect, popupRect, gap, viewportSize) => new Vec2(
            clampDelta(edgeAlignMaxSpace(anchorRect.min.x, anchorRect.max.x, popupRect.min.x, popupRect.max.x, viewportSize.x), popupRect.min.x, popupRect.max.x, viewportSize.x),
            clampDelta(align(anchorRect.min.y - gap, popupRect.max.y), popupRect.min.y, popupRect.max.y, viewportSize.y)
        ),
    }),
    "under": new AttachScheme('under', {
        fits: (anchorRect, popupSize, viewportSize) => popupSize.y <= (viewportSize.y - anchorRect.max.y),
        calcTranslation: (anchorRect, popupRect, gap, viewportSize) => new Vec2(
            clampDelta(edgeAlignMaxSpace(anchorRect.min.x, anchorRect.max.x, popupRect.min.x, popupRect.max.x, viewportSize.x), popupRect.min.x, popupRect.max.x, viewportSize.x),
            clampDelta(align(anchorRect.max.y + gap, popupRect.min.y), popupRect.min.y, popupRect.max.y, viewportSize.y)
        ),
    }),
    "left": new AttachScheme('left', {
        fits: (anchorRect, popupSize, viewportSize) => popupSize.x <= Math.min(anchorRect.min.x, viewportSize.x),
        calcTranslation: (anchorRect, popupRect, gap, viewportSize) => new Vec2(
            clampDelta(align(anchorRect.min.x - gap, popupRect.max.x), popupRect.min.x, popupRect.max.x, viewportSize.x),
            clampDelta(edgeAlignMaxSpace(anchorRect.min.y, anchorRect.max.y, popupRect.min.y, popupRect.max.y, viewportSize.y), popupRect.min.y, popupRect.max.y, viewportSize.y)
        ),
    }),
    "right": new AttachScheme('right', {
        fits: (anchorRect, popupSize, viewportSize) => popupSize.x <= (viewportSize.x - anchorRect.max.x),
        calcTranslation: (anchorRect, popupRect, gap, viewportSize) => new Vec2(
            clampDelta(align(anchorRect.max.x + gap, popupRect.min.x), popupRect.min.x, popupRect.max.x, viewportSize.x),
            clampDelta(edgeAlignMaxSpace(anchorRect.min.y, anchorRect.max.y, popupRect.min.y, popupRect.max.y, viewportSize.y), popupRect.min.y, popupRect.max.y, viewportSize.y)
        ),
    }),
}

const centerSchemes: Schemes = {
    "over": new AttachScheme('over', {
        fits: (anchorRect, popupSize, viewportSize) => popupSize.y <= Math.min(anchorRect.min.y, viewportSize.y),
        calcTranslation: (anchorRect, popupRect, gap, viewportSize) => new Vec2(
            clampDelta(align(center_x(anchorRect), center_x(popupRect)), popupRect.min.x, popupRect.max.x, viewportSize.x),
            clampDelta(align(anchorRect.min.y - gap, popupRect.max.y), popupRect.min.y, popupRect.max.y, viewportSize.y)
        ),
    }),
    "under": new AttachScheme('under', {
        fits: (anchorRect, popupSize, viewportSize) => popupSize.y <= (viewportSize.y - anchorRect.max.y),
        calcTranslation: (anchorRect, popupRect, gap, viewportSize) => new Vec2(
            clampDelta(align(center_x(anchorRect), center_x(popupRect)), popupRect.min.x, popupRect.max.x, viewportSize.x),
            clampDelta(align(anchorRect.max.y + gap, popupRect.min.y), popupRect.min.y, popupRect.max.y, viewportSize.y)
        ),
    }),
    "left": new AttachScheme('left', {
        fits: (anchorRect, popupSize, viewportSize) => popupSize.x <= Math.min(anchorRect.min.x, viewportSize.x),
        calcTranslation: (anchorRect, popupRect, gap, viewportSize) => new Vec2(
            clampDelta(align(anchorRect.min.x - gap, popupRect.max.x), popupRect.min.x, popupRect.max.x, viewportSize.x),
            clampDelta(align(center_y(anchorRect), center_y(popupRect)), popupRect.min.y, popupRect.max.y, viewportSize.y)
        ),
    }),
    "right": new AttachScheme('right', {
        fits: (anchorRect, popupSize, viewportSize) => popupSize.x <= (viewportSize.x - anchorRect.max.x),
        calcTranslation: (anchorRect, popupRect, gap, viewportSize) => new Vec2(
            clampDelta(align(anchorRect.max.x + gap, popupRect.min.x), popupRect.min.x, popupRect.max.x, viewportSize.x),
            clampDelta(align(center_y(anchorRect), center_y(popupRect)), popupRect.min.y, popupRect.max.y, viewportSize.y)
        ),
    }),
}

const edgeFactors: {[name in EdgeName | "unknown"]: EdgeFactor} = {
    "over": { v: -1, h: 0, parallel: rect => ({ min: rect.y, max: rect.y + rect.height }), perpendicular: rect => ({ min: rect.x, max: rect.x + rect.width }) },
    "under": { v: 1, h: 0, parallel: rect => ({ min: rect.y, max: rect.y + rect.height }), perpendicular: rect => ({ min: rect.x, max: rect.x + rect.width }) },
    "left": { v: 0, h: -1, perpendicular: rect => ({ min: rect.y, max: rect.y + rect.height }), parallel: rect => ({ min: rect.x, max: rect.x + rect.width }) },
    "right": { v: 0, h: 1, perpendicular: rect => ({ min: rect.y, max: rect.y + rect.height }), parallel: rect => ({ min: rect.x, max: rect.x + rect.width }) },
    "unknown": { v: 0, h: 0, perpendicular: () => ({ min: 0, max: 0 }), parallel: () => ({ min: 0, max: 0 }) },
}

function getSchemes(align?: Alignment) {
    return align == 'center' ? centerSchemes : edgeSchemes;
}

// parses the text of an "attachment" prop into an array of scheme objects
function edgeNamesToSchemes(edges: EdgeName[], align?: Alignment): Schemes {
    const schemes = getSchemes(align);
    if (!edges)
        return schemes;
    return edges
        .reduce<Schemes>(
            (schemeMap, name) => {
                const trimmedName = name.trim();
                if (schemes[trimmedName])
                    schemeMap[trimmedName] = schemes[trimmedName];
                return schemeMap;
            },
            {}
        )
}

const styles: StylesMap = {
    required: {
        position: 'absolute',
    },
    default: {
        pointerEvents: 'auto',
    },
    prefab_float: {
        boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.5)',
        backgroundColor: 'white',
    },
    prefab_callout: {
        boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.5)',
        backgroundColor: 'white',
        borderRadius: 5,
    },
}

function inflate(r: Rect, d: number): Rect {
    return new Rect(r.min.x - d, r.min.y - d, r.width + d * 2, r.height + d * 2);
}

const bridgeSize = 20;
// precalculate the breadth (size at base) and elevation (distance to peak from base)
const bridgeBreadth = bridgeSize * 2;
const bridgeElev = bridgeSize;


const bridgeProps: {[name in EdgeName]: BridgePropFunction} = {
    over: (anchorRect, popupRect, translation) => ({
        height: bridgeSize,
        width: bridgeSize * 2,
        bottom: -bridgeSize,
        left: clamp(anchorRect.min.x - translation.x + (anchorRect.width * 0.5) - bridgeElev, 0, popupRect.width - bridgeBreadth),
        transform: `translate(${bridgeBreadth * 0.5},${bridgeElev * 0.5}),rotate(0,0,0)`,
    }),
    under: (anchorRect, popupRect, translation) => ({
        height: bridgeSize,
        width: bridgeSize * 2,
        top: -bridgeSize,
        left: clamp(anchorRect.min.x - translation.x + (anchorRect.width * 0.5) - bridgeElev, 0, popupRect.width - bridgeBreadth),
        transform: `translate(${bridgeBreadth * 0.5},${bridgeElev * 0.5}),rotate(180,0,0)`,
    }),
    left: (anchorRect, popupRect, translation) => ({
        height: bridgeSize * 2,
        width: bridgeSize,
        right: -bridgeSize,
        top: clamp(anchorRect.min.y - translation.y + (anchorRect.height * 0.5) - bridgeElev, 0, popupRect.height - bridgeBreadth),
        transform: `translate(${bridgeElev * 0.5},${bridgeBreadth * 0.5}),rotate(-90,0,0)`,
    }),
    right: (anchorRect, popupRect, translation) => ({
        height: bridgeSize * 2,
        width: bridgeSize,
        left: -bridgeSize,
        top: clamp(anchorRect.min.y - translation.y + (anchorRect.height * 0.5) - bridgeElev, 0, popupRect.height - bridgeBreadth),
        transform: `translate(${bridgeElev * 0.5},${bridgeBreadth * 0.5}),rotate(90,0,0)`,
    }),
}

interface BridgeProps {
    schemeName: EdgeName,
    anchorRect?: Rect,
    popupRect?: Rect,
    translation: Vec2,
    style?: CSSProperties,
    outlineStyle?: CSSProperties,
}

function Bridge(props: BridgeProps) {
    const {
        schemeName,
        anchorRect,
        popupRect,
        translation,
        style,
        outlineStyle,
    } = props;

    // do not calculate unless we have a position for the anchor and popup
    if (!anchorRect || !popupRect)
        return null;

    // calculate bridge location
    let { transform, ...bridgeStyle } = bridgeProps[schemeName](anchorRect, popupRect, translation);

    let trianglePath = "M -20.5,-11 0,9.5 20.5,-11 Z";

    let trianglePathOutline = "M -19.5,-10 -20,-10 0,10 20,-10 19.5,-10 0,9.5 Z"
    //let trianglePathOutline = "M -20,-10 0,10 20,-10 0,9.5 Z"

    return (
        <div
            className="bridge"
            style={{
                position: 'absolute',
                overflow: 'visible',
                ...bridgeStyle,
            }}>
            <svg
                style={{ width: bridgeStyle.width, height: bridgeStyle.height, overflow: "visible" }}>
                <g transform={transform}>
                    <path
                        style={{ fill: 'white', ...style }}
                        d={trianglePath} />
                    <path
                        style={{ fill: '#808080', ...outlineStyle }}
                        d={trianglePathOutline} />
                </g>
            </svg>
        </div>
    );
}

function getBaseElement(containerId?: string) {
    return (containerId ? document.getElementById(containerId) : null) || document.body;
}

const withAncestorsOf = (node: null | (Node & ParentNode), cb: (e: Node & ParentNode) => void) => {
    if (node) {
        let e = node.parentNode;
        while (e != null && e != (window as any)) {
            cb(e);
            e = e.parentNode;
        }
    }
}

const chooseScheme = (schemes: Schemes, prevSchemeName: string | undefined, arect: Rect, psize: Vec2, viewport: Vec2) => {
    const prevScheme = prevSchemeName ? schemes[prevSchemeName] : undefined;
    
    // if there is a scheme, and it still fits, nothing to do
    if (prevScheme && prevScheme.fits(arect, psize, viewport) && (Object.values(schemes).indexOf(prevScheme) != -1))
        return prevScheme;

    // otherwise, find the first scheme that fits
    const scheme = Object.values(schemes).find(s => s.fits(arect, psize, viewport)) || prevScheme || schemes[Object.keys(schemes)[0]];
    return scheme;
}

const getViewportSize = () => new Vec2(window.innerWidth, window.innerHeight);


type FloatAffixedProps = {
    prefab?: "float" | "callout",
    defaultEdge?: EdgeName,
    edges: EdgeName[],
    align?: Alignment,
    bridge?: "arrow",
    bridgeStyle?: CSSProperties,
    bridgeOutlineStyle?: CSSProperties,
    render?: (scheme: SchemeName, state: {edges: {anchor?: Bounds, popup?: Bounds}}) => ReactNode,
    className?: string,
    style?: CSSProperties,
    containerId?: string,
    gap?: number,
    children: ReactNode,
    onClickOutside?: () => void,
}
// TODO: rename to Positioning
type FloatAffixedState = {
    translation: Vec2;
    schemeName: SchemeName;
    anchorRect?: Rect;
    popupRect?: Rect;
}
type FloatAffixedRefs = {
    el: HTMLDivElement;
    popup: HTMLDivElement | null;
    anchor: HTMLElement | null;
    schemeName?: AttachScheme;
}

const calcPosition = (prevPositioning: FloatAffixedState, popup: HTMLDivElement, anchor: HTMLElement, gap: number, bridge: "arrow" | undefined, edges: EdgeName[], align: Alignment | undefined) => {
    const prect = elementRectInViewport(popup);
    const psize = prect.getSize();
    const arect = elementRectInViewport(anchor);
    const gapSize = gap + (bridge ? bridgeSize : 0);
    const viewportSize = getViewportSize();

    const schemes = edgeNamesToSchemes(edges, align);
    const scheme = chooseScheme(schemes, prevPositioning.schemeName, inflate(arect, gapSize), psize, viewportSize);
    const delta = scheme.calcTranslation(arect, prect, gapSize, viewportSize);
    const nextTranslation = prevPositioning.translation.clone().add(delta);
    return {
        translation: nextTranslation,
        schemeName: scheme.name,
        anchorRect: arect,
        popupRect: prect,
    };

}

function makeContainer(onClickOutside?: () => void) {
    const div = document.createElement("div");
    if (onClickOutside) {
        // This isn't the most flexible way to do this
        // A more flexible way can be devised when needed
        div.style.backgroundColor = "#0000002b";
        div.style.position = "fixed";
        div.style.left = "0";
        div.style.top = "0";
        div.style.bottom = "0";
        div.style.right = "0";
        div.addEventListener("click", (e) => {
            if (e.target != div)
                return;
            e.stopPropagation();
            e.preventDefault();
            onClickOutside();
        })
    }
    return div;
}

export default function FloatAffixed(props: FloatAffixedProps) {
    // The basic parts of this component are the anchor (where in the DOM the popup should be anchored to)
    // and the popup (the thing that is elsewhere in the DOM but is visually affixed to the anchor)
    const {
        prefab,
        defaultEdge = "under",
        edges,
        align,
        bridge,
        render,
        children,
        className,
        style,
        gap,
        onClickOutside,
        bridgeStyle,
        bridgeOutlineStyle,
        ...restProps
    } = props;

    // These contain the current positioning of the popup
    // this state is changed when it is detected that new positioning parameters are required to keep the popup affixed to the anchor
    const [positioning, setPositioning] = useState<FloatAffixedState>({
        translation: new Vec2(0, 0),
        schemeName: defaultEdge,
    });
    // The refs are just some things we need to keep track of, but which are not part of the renderable state
    const _refs = useRef<FloatAffixedRefs>({
        el: makeContainer(onClickOutside),
        popup: null,
        anchor: null,
    })

    // This is the function that handles events for recalculating the position
    const reposition = () => {
        const {popup, anchor} = _refs.current;
        if (!popup || !anchor)
            return;
        const nextPositioning = calcPosition(positioning, popup, anchor, (gap || 0), bridge, edges, align);
        if (JSON.stringify(nextPositioning) !== JSON.stringify(positioning)) {
            setPositioning(nextPositioning);
        }
    }

    // This creates the place in the DOM for the popup, such that it is above everything else
    useEffect(
        () => {
            const baseElement = getBaseElement(props.containerId);
            baseElement.appendChild(_refs.current.el);
            return () => {
                if (_refs.current.el.parentElement)
                    _refs.current.el.parentElement.removeChild(_refs.current.el);
            }
        },
        [props.containerId]
    )

    // This installs the events that detect if the anchor might have moved and therefore might need to be repositioned
    // if the reposition event handler changes, then we need to attach the new one
    useEffect(
        () => {
            // component did mount
            withAncestorsOf(_refs.current.anchor, e => e.addEventListener("scroll", reposition));
            window.addEventListener("resize", reposition);
            reposition();
            return () => {
                // component will unmount
                window.removeEventListener("resize", reposition);
                withAncestorsOf(_refs.current.anchor, e => e.removeEventListener("scroll", reposition));
            }
        },
        [reposition]
    );

    const { schemeName, anchorRect, popupRect, translation } = positioning;

    const theme = prefab && styles['prefab_' + prefab];
    const popupStyle: Styles = {
        ...styles.default,
        ...theme,
        ...style,
        ...styles.required,
        position: "fixed",
        top: 0,
        left: 0,
        transform: "translate(" + translation.x + "px," + translation.y + "px)",
    };
    const edgeFactor = edgeFactors[schemeName || "unknown"];

    const useChildren = render
        ? render(schemeName, {
            edges: {
                anchor: anchorRect ? edgeFactor.perpendicular(anchorRect) : undefined,
                popup: popupRect ? edgeFactor.perpendicular(translateRect(popupRect, translation)) : undefined,
            },
        })
        : children
    return (
        <React.Fragment>
            <noscript ref={(c) => {_refs.current.anchor = c ? (c.parentNode as HTMLElement) : null}} />
            {ReactDOM.createPortal(
                <div
                    ref={c => (_refs.current.popup = c)}
                    style={popupStyle}
                    {...restProps}
                    className={classNames(
                        "float-affixed",
                        schemeName,
                        className
                    )}>
                    {bridge && <Bridge
                        schemeName={schemeName}
                        anchorRect={anchorRect}
                        popupRect={popupRect}
                        translation={translation}
                        style={bridgeStyle}
                        outlineStyle={bridgeOutlineStyle}
                    /> }
                    {useChildren}
                </div>,
                _refs.current.el)}
        </React.Fragment>
    );
}
