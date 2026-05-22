const express = require('express');

const router = express.Router();

let rows = [
  { id: 1, vehicle_id: 'TRK-204', odometer: 64200, last_rotation_miles: 57250, miles_overdue: 950, tire_set: 'Michelin X Multi', priority: 'high', status: 'schedule_now' },
  { id: 2, vehicle_id: 'VAN-118', odometer: 31840, last_rotation_miles: 28900, miles_overdue: 0, tire_set: 'Goodyear Endurance', priority: 'low', status: 'compliant' },
];
const nextId = () => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

router.get('/', (req, res) => res.json(rows));
router.post('/', (req, res) => {
  const row = { id: nextId(), ...req.body };
  rows.unshift(row);
  res.status(201).json(row);
});
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = rows.findIndex((row) => row.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  rows[idx] = { ...rows[idx], ...req.body, id };
  res.json(rows[idx]);
});
router.delete('/:id', (req, res) => {
  rows = rows.filter((row) => row.id !== Number(req.params.id));
  res.json({ message: 'deleted' });
});

module.exports = router;
