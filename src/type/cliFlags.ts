import { ArgCriterion } from "../model/consoleArgRules";

export 	type ValidationRule = { key: string, value: ArgCriterion[], oneOfType: any};
export 	type ValidationResult = { success: boolean, message: string|undefined};
