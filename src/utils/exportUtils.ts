import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RunsheetResponse, Run } from '../types';

interface ExportOptions {
  runsheetData: RunsheetResponse;
  tanggalReplenish: string;
  siklus: string;
  cabang?: string;
  routeStatusText?: string;
}

/**
 * Helper to download Blob as a file in browser
 */
const downloadFile = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * EXCEL EXPORT (EPIC 1)
 * Generates a colorful, professional Excel workbook with corporate header and formatted table.
 */
export async function exportRunsheetToExcel({
  runsheetData,
  tanggalReplenish,
  siklus,
  cabang = "JAKARTA",
  routeStatusText = "Rute Teroptimasi AI (Post-Switch Trip)"
}: ExportOptions) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'PT. Advantage SCM - Route Plan AI';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Operational Runsheet', {
    views: [{ showGridLines: true }]
  });

  const { ringkasan_operasional, runs } = runsheetData;

  // -----------------------------------------------------------------
  // 1. CORPORATE BANNER / HEADER (Rows 1 - 4)
  // -----------------------------------------------------------------
  sheet.mergeCells('A1:I1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'PT. ADVANTAGE SCM - CASH MANAGEMENT OPERATIONS';
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A8A' } }; // Dark Navy Blue
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(1).height = 30;

  sheet.mergeCells('A2:I2');
  const subTitleCell = sheet.getCell('A2');
  subTitleCell.value = `LAPORAN RUNSHEET REPLENISHMENT ATM & VRP ROUTE PLAN (AI VALIDATED)`;
  subTitleCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'E0E7FF' } };
  subTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E40AF' } }; // Royal Blue
  subTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(2).height = 22;

  sheet.mergeCells('A3:I3');
  const metaCell = sheet.getCell('A3');
  metaCell.value = `Cabang Operasional: ${cabang.toUpperCase()}  |  Tanggal Replenish: ${tanggalReplenish}  |  Siklus: ${siklus}  |  Status Rute: ${routeStatusText}`;
  metaCell.font = { name: 'Calibri', size: 10, italic: true, bold: true, color: { argb: '334155' } };
  metaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
  metaCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(3).height = 20;

  sheet.addRow([]); // Blank row

  // -----------------------------------------------------------------
  // 2. SUMMARY CARDS SECTION (Rows 5 - 8)
  // -----------------------------------------------------------------
  sheet.mergeCells('A5:C5');
  sheet.getCell('A5').value = 'RINGKASAN OPERASIONAL AI';
  sheet.getCell('A5').font = { bold: true, color: { argb: '1E3A8A' }, size: 11 };

  const summaryData = [
    ['Total Run / Mobil', `${ringkasan_operasional.total_run} Run (${ringkasan_operasional.total_mobil})`, 'Total Jarak Tempuh', `${ringkasan_operasional.total_jarak_tempuh_km} Km`],
    ['Total Kunjungan ATM', `${ringkasan_operasional.total_kunjungan_atm} ATM`, 'Total Estimasi Delay', `${ringkasan_operasional.total_estimasi_delay_menit || 0} Menit`],
    ['Kapasitas Kaset', `${ringkasan_operasional.kapasitas_kaset_terpakai}`, 'Engine Optimasi', `${ringkasan_operasional.rekomendasi_engine_terbaik || 'Advantage Smart Route'}`],
  ];

  summaryData.forEach((row) => {
    const addedRow = sheet.addRow([row[0], row[1], '', row[2], row[3]]);
    addedRow.height = 18;
    
    // Format keys
    sheet.getCell(`A${addedRow.number}`).font = { bold: true, size: 9, color: { argb: '475569' } };
    sheet.getCell(`B${addedRow.number}`).font = { bold: true, size: 10, color: { argb: '0F172A' } };
    sheet.getCell(`D${addedRow.number}`).font = { bold: true, size: 9, color: { argb: '475569' } };
    sheet.getCell(`E${addedRow.number}`).font = { bold: true, size: 10, color: { argb: '0F172A' } };

    // Background highlight
    sheet.getCell(`A${addedRow.number}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
    sheet.getCell(`B${addedRow.number}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
    sheet.getCell(`D${addedRow.number}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
    sheet.getCell(`E${addedRow.number}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
  });

  sheet.addRow([]); // Blank row

  // AI Recommendation Callout
  const aiRecRow = sheet.addRow(['Analisis AI:', ringkasan_operasional.alasan_rekomendasi || 'Rute teroptimasi sesuai geofencing & kondisi lalu lintas real-time.']);
  sheet.mergeCells(`B${aiRecRow.number}:I${aiRecRow.number}`);
  sheet.getCell(`A${aiRecRow.number}`).font = { bold: true, size: 9, color: { argb: '1E40AF' } };
  sheet.getCell(`B${aiRecRow.number}`).font = { italic: true, size: 9, color: { argb: '1E3A8A' } };
  sheet.getCell(`B${aiRecRow.number}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EFF6FF' } };

  sheet.addRow([]); // Blank row

  // -----------------------------------------------------------------
  // 3. TABLE DATA HEADER (Colorful Navy Header)
  // -----------------------------------------------------------------
  const headers = [
    'Run',
    'Urutan',
    'Plan No',
    'Nama ATM / Client',
    'Alamat Lokasi',
    'ETA (Jam Tiba)',
    'Status Lalu Lintas',
    'Prediksi Delay',
    'Aturan Khusus'
  ];

  const headerRow = sheet.addRow(headers);
  headerRow.height = 26;

  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } }; // Slate 900
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'medium', color: { argb: '0F172A' } },
      bottom: { style: 'medium', color: { argb: '0F172A' } },
      left: { style: 'thin', color: { argb: '334155' } },
      right: { style: 'thin', color: { argb: '334155' } }
    };
  });

  // -----------------------------------------------------------------
  // 4. TABLE ROWS DATA WITH ZEBRA STRIPING
  // -----------------------------------------------------------------
  let rowIndex = 0;

  runs.forEach((run) => {
    run.rute_kunjungan.forEach((stop) => {
      rowIndex++;
      const isEven = rowIndex % 2 === 0;

      const rules: string[] = [];
      if (stop.is_lewat_tol) rules.push('Tol');
      if (stop.is_zona_ganjil_genap) rules.push('Ganjil-Genap');
      const ruleText = rules.length > 0 ? rules.join(', ') : 'Arteri Umum';

      const dataRow = sheet.addRow([
        run.nama_run.toUpperCase(),
        stop.urutan,
        stop.plan_no,
        stop.nama_client,
        stop.alamat,
        stop.prediksi_jam_tiba_di_lokasi || '08:00',
        stop.status_lalu_lintas || 'Lancar',
        `${stop.prediksi_delay_menit || 0} Menit`,
        ruleText
      ]);

      dataRow.height = 20;

      // Fill color per cell
      dataRow.eachCell((cell, colNumber) => {
        cell.font = { name: 'Calibri', size: 9 };
        cell.alignment = { vertical: 'middle' };

        // Default Zebra Background
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isEven ? 'F8FAFC' : 'FFFFFF' }
        };

        // Alignments
        if (colNumber === 1 || colNumber === 2 || colNumber === 3 || colNumber === 6 || colNumber === 8) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }

        // Special Traffic Highlights
        if (colNumber === 7) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.font = { name: 'Calibri', size: 9, bold: true };
          if (stop.status_lalu_lintas === 'Macet') {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } }; // Light Red
            cell.font = { color: { argb: '991B1B' }, bold: true };
          } else if (stop.status_lalu_lintas === 'Padat') {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEDD5' } }; // Light Orange
            cell.font = { color: { argb: '9A3412' }, bold: true };
          } else {
            cell.font = { color: { argb: '166534' } }; // Dark Green
          }
        }

        // Borders
        cell.border = {
          top: { style: 'thin', color: { argb: 'E2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
          left: { style: 'thin', color: { argb: 'E2E8F0' } },
          right: { style: 'thin', color: { argb: 'E2E8F0' } }
        };
      });
    });
  });

  // -----------------------------------------------------------------
  // 5. AUTO-FIT COLUMNS
  // -----------------------------------------------------------------
  sheet.columns.forEach((column, index) => {
    let maxLength = 12;
    column.eachCell?.({ includeEmpty: false }, (cell) => {
      const cellValue = cell.value ? String(cell.value) : '';
      if (cellValue.length > maxLength && cellValue.length < 50) {
        maxLength = cellValue.length;
      }
    });
    column.width = index === 4 ? 35 : Math.max(maxLength + 3, 12);
  });

  // Generate buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadFile(blob, `Runsheet_Advantage_${cabang}_${tanggalReplenish.replace(/\s+/g, '_')}.xlsx`);
}

/**
 * PDF EXPORT (EPIC 1)
 * Generates an Enterprise PDF report using jsPDF and autoTable.
 */
export function exportRunsheetToPdf({
  runsheetData,
  tanggalReplenish,
  siklus,
  cabang = "JAKARTA",
  routeStatusText = "Rute Teroptimasi AI (Post-Switch Trip)"
}: ExportOptions) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const { ringkasan_operasional, runs } = runsheetData;

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 297, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PT. ADVANTAGE SCM - CASH OPERATIONS', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`CABANG: ${cabang.toUpperCase()} | TANGGAL: ${tanggalReplenish} | SIKLUS: ${siklus}`, 14, 18);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(52, 211, 153); // Emerald 400
  doc.text(`STATUS: ${routeStatusText}`, 200, 18);

  // Summary Metrics Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 28, 269, 18, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 28, 269, 18, 2, 2, 'S');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('RINGKASAN OPERASIONAL:', 18, 34);

  doc.setFont('helvetica', 'normal');
  doc.text(`Total Run: ${ringkasan_operasional.total_run} Run (${ringkasan_operasional.total_mobil})`, 18, 40);
  doc.text(`Total ATM: ${ringkasan_operasional.total_kunjungan_atm} Location`, 80, 40);
  doc.text(`Total Jarak: ${ringkasan_operasional.total_jarak_tempuh_km} Km`, 140, 40);
  doc.text(`Delay Macet: ${ringkasan_operasional.total_estimasi_delay_menit || 0} Mins`, 190, 40);

  // Table Data Preparation
  const tableRows: any[] = [];

  runs.forEach((run) => {
    run.rute_kunjungan.forEach((stop) => {
      const rules: string[] = [];
      if (stop.is_lewat_tol) rules.push('Tol');
      if (stop.is_zona_ganjil_genap) rules.push('Ganjil-Genap');
      const ruleText = rules.length > 0 ? rules.join(', ') : 'Arteri Umum';

      tableRows.push([
        run.nama_run.toUpperCase(),
        stop.urutan,
        stop.plan_no,
        stop.nama_client,
        stop.alamat.length > 45 ? stop.alamat.substring(0, 45) + '...' : stop.alamat,
        stop.prediksi_jam_tiba_di_lokasi || '08:00',
        stop.status_lalu_lintas || 'Lancar',
        `${stop.prediksi_delay_menit || 0}m`,
        ruleText
      ]);
    });
  });

  autoTable(doc, {
    startY: 50,
    head: [['Run', 'Urutan', 'Plan No', 'Nama ATM / Client', 'Alamat', 'ETA', 'Lalu Lintas', 'Delay', 'Aturan']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      valign: 'middle'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 18 },
      1: { halign: 'center', cellWidth: 14 },
      2: { halign: 'center', cellWidth: 22 },
      3: { cellWidth: 48, fontStyle: 'bold' },
      4: { cellWidth: 80 },
      5: { halign: 'center', cellWidth: 18 },
      6: { halign: 'center', cellWidth: 22 },
      7: { halign: 'center', cellWidth: 16 },
      8: { cellWidth: 30 }
    },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 6) {
        const val = data.cell.raw;
        if (val === 'Macet') {
          data.cell.styles.textColor = [185, 28, 28]; // Red
          data.cell.styles.fontStyle = 'bold';
        } else if (val === 'Padat') {
          data.cell.styles.textColor = [194, 65, 12]; // Orange
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [22, 101, 52]; // Green
        }
      }
    }
  });

  // Footer page number
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Halaman ${i} dari ${totalPages} - PT. Advantage SCM Route Plan AI Report`, 14, 202);
  }

  doc.save(`Runsheet_Advantage_${cabang}_${tanggalReplenish.replace(/\s+/g, '_')}.pdf`);
}
