import test from 'node:test';
import assert from 'node:assert/strict';
import {statusAfterCheckboxClick,STATUS_OPTIONS} from '../lib/task-status.ts';

test('완료 체크 해제는 진행 중이 아니라 예정으로 복귀',()=>{
 assert.equal(statusAfterCheckboxClick('completed'),'todo');
});
test('예정 또는 진행 중에서 체크하면 완료',()=>{
 assert.equal(statusAfterCheckboxClick('todo'),'completed');
 assert.equal(statusAfterCheckboxClick('doing'),'completed');
});
test('상태 메뉴는 세 상태를 각각 직접 선택할 수 있다',()=>{
 assert.deepEqual(STATUS_OPTIONS.map(x=>x.value),['todo','doing','completed']);
 assert.deepEqual(STATUS_OPTIONS.map(x=>x.label),['예정','진행 중','완료']);
});
