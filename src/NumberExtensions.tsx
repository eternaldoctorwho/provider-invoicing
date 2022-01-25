declare global {
    interface Number {
        toUSD: () => string,
    }
}

Number.prototype.toUSD = function (): string {
    return this || this === 0 ? `$${this.toFixed(2)}` : "";
};

export default {}