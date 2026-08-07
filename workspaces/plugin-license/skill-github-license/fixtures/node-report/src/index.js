const PDFDocument = require("pdfkit");
const dayjs = require("dayjs");
const { renderQR } = require("libqr");

function buildInvoice(order, stream) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(stream);
  doc.fontSize(20).text(`Invoice ${order.id}`);
  doc.fontSize(10).text(dayjs(order.date).format("D MMM YYYY"));
  doc.image(renderQR(order.paymentUri), 400, 60, { width: 120 });
  doc.end();
}

module.exports = { buildInvoice };
