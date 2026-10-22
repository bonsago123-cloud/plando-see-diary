import type {TaskStatus} from './types';

/** The checkbox marks complete or returns to planned. Use the status selector for doing. */
export function statusAfterCheckboxClick(status:TaskStatus):TaskStatus {
 return status==='completed'?'todo':'completed';
}

/** Explicit state choices, not a cycle that skips planned. */
export const STATUS_OPTIONS:ReadonlyArray<{value:TaskStatus;label:string}> = [
 {value:'todo',label:'예정'},
 {value:'doing',label:'진행 중'},
 {value:'completed',label:'완료'},
];
