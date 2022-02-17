export default class Thread {
    static Sleep: (conditions: {forMilliseconds: number, if?: (set: any[]) => boolean, set?: any[]}) => Promise<void> =
    async(conditions: { forMilliseconds: number; if?: (set: Worker[]) => boolean; set?: any[]; }) => {
        // sleep on the current thread for the given milliseconds while the given condition applied on the given set is true
        if(conditions.if && conditions.set){
            while(conditions.if.apply(this, [conditions.set])) 
                await new Promise((resolve) => setTimeout(resolve, conditions.forMilliseconds));
            return;
        }

        // sleep on the current thread for the given milliseconds just once as no pre-requisite is given.
        return await new Promise((resolve) => setTimeout(resolve, conditions.forMilliseconds));
    }
}