import * as s from "../model/view/sinda"

export default class Style {
    //mixins
    static BlockOutlineModifier(borderStyle="round", borderColor:string="rgb(166,252,240)"): s.Styles {
        return ({
            borderStyle: borderStyle as string | any,
            borderColor: borderColor,   
        })
    };

    static centeredFlexContainerRules(dimension: {width: number|string, height: number|string}): s.Styles {
        const isString: boolean = (typeof dimension.width == "string" || Object.prototype.toString.call(dimension.width) == '[object String]')
        && (typeof dimension.height == "string" || Object.prototype.toString.call(dimension.height) == '[object String]');
        
        if (isString){
            return ({ 
                width: dimension.height,
                height: dimension.width,
                justifyContent:"center",
            })
        }

        return ({ 
            width: Number(dimension.width) -1.5,
            height: Number(dimension.height) -1.5,
            justifyContent:"center",
        })
    }

    static PaddingModifier(dimensions: number[]){
        switch (dimensions.length) {
            case 1:
                return ({
                    paddingTop: dimensions[0],
                    paddingRight: dimensions[0],
                    paddingBottom: dimensions[0],
                    paddingLeft: dimensions[0],
                })
            case 2: 
                return ({
                    paddingTop: dimensions[0],
                    paddingRight: dimensions[1]
                })
            break;
            
            case 3:
                return ({
                    paddingTop: dimensions[0],
                    paddingRight: dimensions[1],
                    paddingLeft: dimensions[1],
                    paddingBottom: dimensions[2]
                })                          
            default:
                return ({
                    paddingTop: dimensions[0],
                    paddingRight: dimensions[1],
                    paddingBottom: dimensions[2],
                    paddingLeft: dimensions[3],
                })
        }
    }
}