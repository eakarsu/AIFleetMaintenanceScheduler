'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const{evaluateMaintenancePlan}=require('../domain/maintenancePlan');
const valid={vehicles:[{id:'v1',odometerKm:1000}],technicians:[{id:'t1',availableHours:8}],parts:[{sku:'p1',available:2}],workOrders:[{id:'w1',vehicleId:'v1',laborHours:4,requiredParts:[{sku:'p1',quantity:1}]}]};
test('checks parts and labor capacity',()=>{const x=evaluateMaintenancePlan(valid);assert.deepEqual(x.errors,[]);assert.equal(x.result.laborCapacityFeasible,true);assert.equal(x.result.decision,'reviewable')});
test('detects part shortages',()=>{const x=evaluateMaintenancePlan({...valid,parts:[]});assert.equal(x.result.evaluatedOrders[0].schedulable,false);assert.equal(x.result.decision,'revise')});
test('detects repeat repairs',()=>{const order={...valid.workOrders[0],system:'brakes'};const x=evaluateMaintenancePlan({...valid,workOrders:[order,{...order,id:'w2'}]});assert.equal(x.result.repeatRepairCount,2)});
