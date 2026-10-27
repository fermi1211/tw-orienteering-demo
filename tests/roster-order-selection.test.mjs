import test from 'node:test';
import assert from 'node:assert/strict';
import {ordersForRoster} from '../src/registration-order-model.js';

const rows = [
  {id:'p1',orderId:'group',eventId:'winter',division:'ME',payment:'BANK_TRANSFER',status:'RECONCILED',amount:450},
  {id:'p2',orderId:'group',eventId:'winter',division:'WA',payment:'BANK_TRANSFER',status:'RECONCILED',amount:450},
  {id:'p3',orderId:'group',eventId:'winter',division:'OPEN',payment:'ONSITE',status:'ONSITE',amount:450},
  {id:'single',eventId:'winter',division:'ME',payment:'BANK_TRANSFER',status:'PENDING',amount:450},
  {id:'summer',eventId:'summer',division:'ME',payment:'BANK_TRANSFER',status:'RECONCILED',amount:450},
];

test('roster order choices contain exactly the distinct orders in matching registrations',()=>{
  const matching=rows.filter(row=>row.eventId==='winter'&&row.status==='RECONCILED');
  assert.deepEqual(ordersForRoster(rows,matching,'winter').map(order=>order.id),['group']);
  assert.deepEqual(ordersForRoster(rows,rows.filter(row=>row.division==='ME'),'winter').map(order=>order.id),['group','single']);
});

test('a partial roster match retains all participants and bank totals for reconciliation',()=>{
  const [order]=ordersForRoster(rows,[rows[0]],'winter');
  assert.equal(order.all.length,3);
  assert.equal(order.amount,1350);
  assert.equal(order.bank,900);
  assert.equal(order.onsite,450);
  assert.deepEqual(order.bankRows.map(row=>row.id),['p1','p2']);
  assert.equal(order.canUndoReconciliation,true);
});

test('empty results do not fall back to unrelated event orders',()=>{
  assert.deepEqual(ordersForRoster(rows,[],'winter'),[]);
  assert.deepEqual(ordersForRoster(rows,[rows[4]],'winter'),[]);
  assert.deepEqual(ordersForRoster(rows,[{id:'missing',eventId:'winter'}],'winter'),[]);
});

test('cancelled and deleted views use their supplied roster matches without changing records',()=>{
  const archived=[...rows,
    {id:'cancelled',eventId:'winter',payment:'BANK_TRANSFER',status:'PENDING',amount:450,cancelledAt:'2026-10-27'},
    {id:'deleted',eventId:'winter',payment:'BANK_TRANSFER',status:'RECONCILED',amount:450,deletedAt:'2026-10-27'},
  ];
  const before=structuredClone(archived);
  assert.deepEqual(ordersForRoster(archived,archived.filter(row=>row.cancelledAt),'winter').map(order=>order.id),['cancelled']);
  assert.deepEqual(ordersForRoster(archived,archived.filter(row=>row.deletedAt),'winter').map(order=>order.id),['deleted']);
  assert.deepEqual(archived,before);
});
