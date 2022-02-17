export const merge: (objects: object[]) => object = (objects) => Object.assign({}, ...objects);
export const capitalize: (element: string) => string = (elem) => elem && elem.charAt(0).toUpperCase() + elem.slice(1);
