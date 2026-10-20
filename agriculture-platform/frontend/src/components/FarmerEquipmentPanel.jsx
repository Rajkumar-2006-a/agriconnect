import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { imageUrl, DEFAULT_EQUIPMENT_IMAGE } from '../services/api';
import '../pages/DetailPages.css';

export default function FarmerEquipmentPanel() {
  const [equipment, setEquipment] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/equipment').then((response) => setEquipment(response.data.filter((item) => item.availability))).catch(() => setError('Unable to load available equipment.')); }, []);
  return <section className="container pb-5 farmer-equipment-panel"><div className="farm-panel"><div className="d-flex justify-content-between align-items-center gap-3 mb-3"><div><h2 className="mb-1">Available rental equipment</h2><p className="text-muted mb-0">Select equipment and send your rental request.</p></div><Link className="btn btn-success" to="/equipment">View all equipment</Link></div>{error && <p className="text-danger">{error}</p>}<div className="equipment-contact-grid">{equipment.length ? equipment.map((item) => <article className="listing-row equipment-listing" key={item._id}>{item.image ? <img src={imageUrl(item.image, DEFAULT_EQUIPMENT_IMAGE)} alt={item.equipmentName} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = DEFAULT_EQUIPMENT_IMAGE; }} /> : <div className="equipment-thumb-empty">No photo</div>}<div><b>{item.equipmentName}</b><small>{item.category} · {item.location} · Rs. {item.rentalPrice}/day</small><small>Owner: {item.owner?.name} {item.owner?.phone && <a href={`tel:${item.owner.phone}`}>· {item.owner.phone}</a>}</small></div><Link className="btn btn-sm btn-outline-success" to={`/equipment/${item._id}`}>Details</Link></article>) : <p className="text-muted mb-0">No equipment is available right now.</p>}</div></div></section>;
}
