declare global {
    interface String {
        fromUSD: () => number,
    }
}

String.prototype.fromUSD = function (): number {
    const f = parseFloat(this.toString().replace('$', ''));
    return typeof f === 'number' && !isNaN(f) ? f : 0;
};

export default {}