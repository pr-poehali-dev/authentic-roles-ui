declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  export interface UserOptions {
    startY?: number;
    head?: any[][];
    body?: any[][];
    theme?: 'striped' | 'grid' | 'plain';
    headStyles?: any;
    bodyStyles?: any;
    alternateRowStyles?: any;
    columnStyles?: any;
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
    styles?: any;
  }

  export default function autoTable(doc: jsPDF, options: UserOptions): void;
}
