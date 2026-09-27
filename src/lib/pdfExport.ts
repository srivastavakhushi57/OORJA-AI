import jsPDF from 'jspdf';
import { Community, DataCenter, EnergyCalculationResult } from '../types';
import { MONTH_NAMES } from './energy';

export function exportDataCenterPdfReport(
  dc: DataCenter,
  calc: EnergyCalculationResult,
  monthIndex: number,
  communities: Community[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  let y = 20;

  // Header Bar (Deep Earth Green)
  doc.setFillColor(18, 70, 50);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('OORJA AI — Data Center Energy Recovery Report', margin, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Earth Forward Hackathon | Clean Computing & Waste Heat Reuse Initiative', margin, 21);

  y = 36;
  doc.setTextColor(30, 41, 59);

  // Facility Title & Meta
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(dc.name, margin, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Operator: ${dc.operator} | Location: ${dc.city}, ${dc.country} | Month: ${MONTH_NAMES[monthIndex]} | Generated: ${new Date().toLocaleDateString()}`,
    margin,
    y
  );
  y += 10;

  // Facility Specifications Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Facility Specifications', margin + 4, y + 6);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  const col1 = margin + 4;
  const col2 = margin + 50;
  const col3 = margin + 105;

  doc.text(`Capacity: ${dc.capacity_mw} MW`, col1, y + 13);
  doc.text(`Cooling System: ${dc.cooling_type.toUpperCase()}`, col1, y + 20);

  doc.text(`Base PUE: ${dc.pue}`, col2, y + 13);
  doc.text(`Renewable Energy: ${dc.renewable_share_pct}%`, col2, y + 20);

  doc.text(`Grid Factor: ${dc.grid_emission_factor_g_per_kwh} gCO2/kWh`, col3, y + 13);
  doc.text(`Data Quality: ${dc.data_quality}`, col3, y + 20);

  y += 36;

  // Monthly Recovery Key Metrics (Cards)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(18, 70, 50);
  doc.text(`Monthly Energy Recovery Estimate (${MONTH_NAMES[monthIndex]})`, margin, y);
  y += 6;

  const cardWidth = (pageWidth - margin * 2 - 9) / 4;
  const cardHeight = 22;

  const kpis = [
    { label: 'Recoverable Heat', val: `${calc.recoverable_heat_mwh.toLocaleString()} MWh` },
    { label: 'Power via ORC', val: `${calc.electricity_from_heat_mwh.toLocaleString()} MWh` },
    { label: 'CO2 Avoided', val: `${calc.co2_avoided_tons.toLocaleString()} tCO2` },
    { label: 'Households Met', val: `${calc.households_heat_met.toLocaleString()} homes` },
  ];

  kpis.forEach((kpi, i) => {
    const x = margin + i * (cardWidth + 3);
    doc.setFillColor(241, 248, 245);
    doc.setDrawColor(180, 220, 205);
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(kpi.label, x + 3, y + 7);

    doc.setTextColor(18, 70, 50);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text(kpi.val, x + 3, y + 16);
  });

  y += cardHeight + 10;

  // Energy Balance Breakdown
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Thermodynamic Energy Balance', margin, y);
  y += 5;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`• Total IT Electricity Input: ${calc.monthly_it_elec_mwh.toLocaleString()} MWh`, margin + 2, y);
  y += 5;
  doc.text(`• Total IT Thermal Dissipation (~98%): ${calc.total_waste_heat_mwh.toLocaleString()} MWh`, margin + 2, y);
  y += 5;
  doc.text(`• Net Usable Recovered Heat: ${calc.net_delivered_thermal_mwh.toLocaleString()} MWh (post pipe transmission losses)`, margin + 2, y);
  y += 5;
  doc.text(`• Unrecoverable Low-Delta Heat: ${calc.unrecoverable_heat_mwh.toLocaleString()} MWh`, margin + 2, y);
  y += 10;

  // Top Nearby Communities Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(18, 70, 50);
  doc.text('Top Nearby Villages & Communities in Range', margin, y);
  y += 6;

  // Table Header
  doc.setFillColor(230, 240, 235);
  doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(18, 70, 50);

  doc.text('Community Name', margin + 3, y + 5);
  doc.text('Type', margin + 55, y + 5);
  doc.text('Distance', margin + 80, y + 5);
  doc.text('Population', margin + 105, y + 5);
  doc.text('Heat Need', margin + 130, y + 5);
  doc.text('Suitability', margin + 155, y + 5);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  const topComms = communities.slice(0, 5);
  topComms.forEach((comm) => {
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, pageWidth - margin * 2, 6, 'F');

    doc.text(comm.name.substring(0, 24), margin + 3, y + 4.5);
    doc.text(comm.type, margin + 55, y + 4.5);
    doc.text(`${comm.distance_km} km`, margin + 80, y + 4.5);
    doc.text(comm.population.toLocaleString(), margin + 105, y + 4.5);
    doc.text(`${comm.estimated_monthly_heat_demand_mwh} MWh`, margin + 130, y + 4.5);
    doc.text(`${comm.suitability_score}% (${comm.pipeline_feasibility})`, margin + 155, y + 4.5);

    y += 6;
  });

  y += 8;

  // Environmental Impact & Equivalencies
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(18, 70, 50);
  doc.text('Environmental Equivalencies & Carbon Offset', margin, y);
  y += 6;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(
    `• Equivalent to planting ${calc.equivalent_trees.toLocaleString()} mature urban trees absorbing CO2.`,
    margin + 2,
    y
  );
  y += 5;
  doc.text(
    `• Equivalent to removing ${calc.equivalent_cars_off_road.toLocaleString()} gasoline passenger vehicles off the road.`,
    margin + 2,
    y
  );
  y += 5;
  doc.text(
    `• Avoided emissions against direct diesel boiler heating: ${calc.co2_avoided_diesel_tons.toLocaleString()} tCO2/month.`,
    margin + 2,
    y
  );
  y += 12;

  // Methodology and Scientific Honesty Footer
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text(
    'OORJA AI Methodology: Waste heat calculated via first principles of thermodynamics (Q = P_IT * eta_capture).',
    margin,
    y
  );
  y += 3.5;
  doc.text(
    'Transmission thermal loss model applies a distance decay factor (~0.5%/km for vacuum insulated pre-stressed piping).',
    margin,
    y
  );
  y += 3.5;
  doc.text(
    'Sources: OpenStreetMap (Overpass API), Open-Meteo Climatology, NASA POWER, and IEA Grid Carbon Intensity Factors.',
    margin,
    y
  );

  // Save the PDF
  const filename = `Oorja_AI_${dc.name.replace(/[^a-zA-Z0-9]/g, '_')}_Energy_Report.pdf`;
  doc.save(filename);
}

export function exportCommunitiesCsv(dc: DataCenter, communities: Community[]) {
  const headers = [
    'Community Name',
    'Type',
    'Latitude',
    'Longitude',
    'Distance (km)',
    'Population',
    'Monthly Heat Demand (MWh)',
    'Monthly Elec Demand (MWh)',
    'Suitability Score (%)',
    'Pipeline Feasibility',
    'Pipe Loss (%)',
    'Notes',
  ];

  const rows = communities.map((c) => [
    `"${c.name}"`,
    c.type,
    c.latitude,
    c.longitude,
    c.distance_km,
    c.population,
    c.estimated_monthly_heat_demand_mwh,
    c.estimated_monthly_elec_demand_mwh,
    c.suitability_score,
    c.pipeline_feasibility,
    c.pipe_loss_pct,
    `"${(c.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${dc.id}_nearby_communities.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
