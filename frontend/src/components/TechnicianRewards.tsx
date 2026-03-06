import React, { useEffect, useState } from 'react';
import { Mission, RewardItem, Technician } from '../types';
import { technicianRewardsService } from '../services/technicianRewardsService';
import './TechnicianRewards.css';

const TechnicianRewards: React.FC = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    area: '',
    skillLevel: 'junior',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [technicianData, missionData, rewardData] = await Promise.all([
        technicianRewardsService.getTechnicians(),
        technicianRewardsService.getMissions(),
        technicianRewardsService.getRewardCatalog(),
      ]);
      setTechnicians(technicianData);
      setMissions(missionData);
      setRewards(rewardData);
      if (!selectedTechnicianId && technicianData.length > 0) {
        setSelectedTechnicianId(technicianData[0].id);
      }
    } catch (error) {
      setMessage('ไม่สามารถโหลดข้อมูลระบบช่างได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await technicianRewardsService.registerTechnician(form);
      setMessage('ลงทะเบียนช่างสำเร็จ');
      setForm({ fullName: '', phone: '', area: '', skillLevel: 'junior' });
      await loadData();
    } catch (error: any) {
      setMessage(error?.response?.data?.error || 'ลงทะเบียนไม่สำเร็จ');
    }
  };

  const handleCompleteMission = async (missionId: number) => {
    if (!selectedTechnicianId) {
      setMessage('กรุณาเลือกช่างก่อนทำภารกิจ');
      return;
    }

    try {
      await technicianRewardsService.completeMission(missionId, selectedTechnicianId);
      setMessage('รับคะแนนจากภารกิจเรียบร้อยแล้ว');
      await loadData();
    } catch (error: any) {
      setMessage(error?.response?.data?.error || 'ทำภารกิจไม่สำเร็จ');
    }
  };

  const handleRedeem = async (rewardId: number) => {
    if (!selectedTechnicianId) {
      setMessage('กรุณาเลือกช่างก่อนแลกของรางวัล');
      return;
    }

    try {
      await technicianRewardsService.redeemReward(selectedTechnicianId, rewardId);
      setMessage('แลกของรางวัลสำเร็จ');
      await loadData();
    } catch (error: any) {
      setMessage(error?.response?.data?.error || 'ไม่สามารถแลกรางวัลได้');
    }
  };

  const selectedTechnician = technicians.find((technician) => technician.id === selectedTechnicianId);

  return (
    <div className="technician-rewards-page">
      <h2>ระบบลงทะเบียนช่าง + สะสมคะแนนแลกของรางวัล</h2>

      <form className="register-form" onSubmit={onRegister}>
        <input
          placeholder="ชื่อ-นามสกุลช่าง"
          value={form.fullName}
          onChange={(event) => setForm({ ...form, fullName: event.target.value })}
          required
        />
        <input
          placeholder="เบอร์โทร"
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
          required
        />
        <input
          placeholder="พื้นที่รับผิดชอบ"
          value={form.area}
          onChange={(event) => setForm({ ...form, area: event.target.value })}
          required
        />
        <select
          value={form.skillLevel}
          onChange={(event) => setForm({ ...form, skillLevel: event.target.value })}
        >
          <option value="junior">Junior</option>
          <option value="senior">Senior</option>
          <option value="expert">Expert</option>
        </select>
        <button type="submit">ลงทะเบียนช่าง</button>
      </form>

      {message && <p className="system-message">{message}</p>}

      <div className="technician-selector">
        <label htmlFor="technician-selector">เลือกช่างเพื่อทำภารกิจ/แลกรางวัล:</label>
        <select
          id="technician-selector"
          value={selectedTechnicianId}
          onChange={(event) => setSelectedTechnicianId(Number(event.target.value))}
        >
          {technicians.map((technician) => (
            <option key={technician.id} value={technician.id}>
              {technician.full_name} ({technician.points_balance} คะแนน)
            </option>
          ))}
        </select>
      </div>

      {selectedTechnician && (
        <div className="points-banner">
          คะแนนคงเหลือของ {selectedTechnician.full_name}: <strong>{selectedTechnician.points_balance}</strong>
        </div>
      )}

      <div className="grid-sections">
        <section>
          <h3>ภารกิจ</h3>
          {loading ? (
            <p>กำลังโหลด...</p>
          ) : (
            missions.map((mission) => (
              <div className="card" key={mission.id}>
                <h4>{mission.title}</h4>
                <p>{mission.description}</p>
                <p>
                  รับ <strong>{mission.points_reward}</strong> คะแนน ({mission.frequency})
                </p>
                <button onClick={() => handleCompleteMission(mission.id)}>ทำภารกิจนี้</button>
              </div>
            ))
          )}
        </section>

        <section>
          <h3>ของรางวัล</h3>
          {loading ? (
            <p>กำลังโหลด...</p>
          ) : (
            rewards.map((reward) => (
              <div className="card" key={reward.id}>
                <h4>{reward.item_name}</h4>
                <p>
                  ใช้ {reward.points_cost} คะแนน | คงเหลือ {reward.stock} ชิ้น
                </p>
                <button onClick={() => handleRedeem(reward.id)}>แลกรางวัล</button>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
};

export default TechnicianRewards;
