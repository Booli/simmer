export function fieldSorter(fields) {
    return (a, b) => fields.map(o => {
        let dir = 1;
        if (o[0] === '-') { dir = -1; o=o.substring(1); }
        return a[o] > b[o] ? dir : a[o] < b[o] ? -(dir) : 0;
    }).reduce((p,n) => p ? p : n, 0);
}

export function filterColor(colorsetting, collection) {
  return colorsetting
    .map((setting, index) => setting & Math.round(collection[index]))
    .reduce((a,b) => a | b)
}