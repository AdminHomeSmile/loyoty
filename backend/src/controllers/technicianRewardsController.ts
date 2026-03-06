import { Request, Response } from 'express';
import { runExecute, runQuery, runQuerySingle } from '../database/init';

export const registerTechnician = async (req: Request, res: Response) => {
  try {
    const { fullName, phone, area, skillLevel = 'junior' } = req.body;

    if (!fullName || !phone || !area) {
      res.status(400).json({ error: 'fullName, phone and area are required' });
      return;
    }

    const result = await runExecute(
      `INSERT INTO technicians (full_name, phone, area, skill_level) VALUES (?, ?, ?, ?)`,
      [fullName, phone, area, skillLevel]
    );

    const technician = await runQuerySingle(
      `SELECT id, full_name, phone, area, skill_level, points_balance, created_at
       FROM technicians
       WHERE id = ?`,
      [result.lastID]
    );

    res.status(201).json(technician);
  } catch (error) {
    console.error('Error registering technician:', error);
    res.status(500).json({ error: 'Failed to register technician' });
  }
};

export const getTechnicians = async (_req: Request, res: Response) => {
  try {
    const technicians = await runQuery(
      `SELECT id, full_name, phone, area, skill_level, points_balance, created_at
       FROM technicians
       ORDER BY created_at DESC`
    );

    res.json(technicians);
  } catch (error) {
    console.error('Error fetching technicians:', error);
    res.status(500).json({ error: 'Failed to fetch technicians' });
  }
};

export const getMissions = async (_req: Request, res: Response) => {
  try {
    const missions = await runQuery(
      `SELECT id, title, description, points_reward, frequency
       FROM missions
       ORDER BY points_reward DESC`
    );

    res.json(missions);
  } catch (error) {
    console.error('Error fetching missions:', error);
    res.status(500).json({ error: 'Failed to fetch missions' });
  }
};

export const completeMission = async (req: Request, res: Response) => {
  try {
    const missionId = Number(req.params.missionId);
    const { technicianId } = req.body;

    if (!technicianId || Number.isNaN(missionId)) {
      res.status(400).json({ error: 'technicianId and valid missionId are required' });
      return;
    }

    const mission = await runQuerySingle('SELECT * FROM missions WHERE id = ?', [missionId]);
    if (!mission) {
      res.status(404).json({ error: 'Mission not found' });
      return;
    }

    const technician = await runQuerySingle('SELECT * FROM technicians WHERE id = ?', [technicianId]);
    if (!technician) {
      res.status(404).json({ error: 'Technician not found' });
      return;
    }

    if (mission.frequency === 'once') {
      const existing = await runQuerySingle(
        `SELECT id FROM technician_missions WHERE technician_id = ? AND mission_id = ?`,
        [technicianId, missionId]
      );
      if (existing) {
        res.status(409).json({ error: 'This mission can only be completed once' });
        return;
      }
    }

    await runExecute(
      `INSERT INTO technician_missions (technician_id, mission_id, points_earned)
       VALUES (?, ?, ?)`,
      [technicianId, missionId, mission.points_reward]
    );

    await runExecute(
      `UPDATE technicians
       SET points_balance = points_balance + ?
       WHERE id = ?`,
      [mission.points_reward, technicianId]
    );

    const updated = await runQuerySingle(
      `SELECT id, full_name, points_balance FROM technicians WHERE id = ?`,
      [technicianId]
    );

    res.json({
      message: 'Mission completed and points awarded',
      technician: updated,
      mission: {
        id: mission.id,
        title: mission.title,
        points: mission.points_reward,
      },
    });
  } catch (error) {
    console.error('Error completing mission:', error);
    res.status(500).json({ error: 'Failed to complete mission' });
  }
};

export const getRewardsCatalog = async (_req: Request, res: Response) => {
  try {
    const rewards = await runQuery(
      `SELECT id, item_name, points_cost, stock
       FROM reward_catalog
       WHERE is_active = 1
       ORDER BY points_cost ASC`
    );

    res.json(rewards);
  } catch (error) {
    console.error('Error fetching rewards catalog:', error);
    res.status(500).json({ error: 'Failed to fetch rewards catalog' });
  }
};

export const redeemReward = async (req: Request, res: Response) => {
  try {
    const { technicianId, rewardId } = req.body;

    if (!technicianId || !rewardId) {
      res.status(400).json({ error: 'technicianId and rewardId are required' });
      return;
    }

    const technician = await runQuerySingle('SELECT * FROM technicians WHERE id = ?', [technicianId]);
    if (!technician) {
      res.status(404).json({ error: 'Technician not found' });
      return;
    }

    const reward = await runQuerySingle(
      'SELECT * FROM reward_catalog WHERE id = ? AND is_active = 1',
      [rewardId]
    );
    if (!reward) {
      res.status(404).json({ error: 'Reward not found' });
      return;
    }

    if (reward.stock <= 0) {
      res.status(409).json({ error: 'Reward is out of stock' });
      return;
    }

    if (technician.points_balance < reward.points_cost) {
      res.status(409).json({ error: 'Not enough points to redeem this reward' });
      return;
    }

    await runExecute(
      `INSERT INTO reward_redemptions (technician_id, reward_id, points_spent)
       VALUES (?, ?, ?)`,
      [technicianId, rewardId, reward.points_cost]
    );

    await runExecute(
      `UPDATE technicians
       SET points_balance = points_balance - ?
       WHERE id = ?`,
      [reward.points_cost, technicianId]
    );

    await runExecute(
      `UPDATE reward_catalog
       SET stock = stock - 1
       WHERE id = ?`,
      [rewardId]
    );

    const updated = await runQuerySingle(
      'SELECT id, full_name, points_balance FROM technicians WHERE id = ?',
      [technicianId]
    );

    res.json({
      message: 'Reward redeemed successfully',
      technician: updated,
      reward: {
        id: reward.id,
        itemName: reward.item_name,
        pointsCost: reward.points_cost,
      },
    });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    res.status(500).json({ error: 'Failed to redeem reward' });
  }
};
