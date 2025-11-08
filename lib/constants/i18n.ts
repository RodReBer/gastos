// i18n translations - SOLID Open/Closed Principle
export const translations = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.invoices": "Invoices",
    "nav.payments": "Payments",
    "nav.reports": "Reports",
    "nav.settings": "Settings",

    // Payment Types
    "payment_types.cash": "Cash",
    "payment_types.card": "Card",
    "payment_types.transfer": "Transfer",
    "payment_types.check": "Check",
    "payment_types.other": "Other",

    // Invoice Statuses
    "invoice_statuses.pending": "Pending",
    "invoice_statuses.partial": "Partial",
    "invoice_statuses.paid": "Paid",

    // Payment Statuses
    "payment_statuses.pending": "Pending",
    "payment_statuses.completed": "Completed",
    "payment_statuses.failed": "Failed",

    // Forms
    "form.vendor_name": "Vendor Name",
    "form.amount": "Amount",
    "form.currency": "Currency",
    "form.invoice_date": "Invoice Date",
    "form.invoice_number": "Invoice Number (optional)",
    "form.description": "Description",
    "form.payment_date": "Payment Date",
    "form.payment_type": "Payment Type",
    "form.amount_paid": "Amount Paid",
    "form.status": "Status",
    "form.notes": "Notes",
    "form.submit": "Submit",
    "form.cancel": "Cancel",

    // Buttons
    "btn.add_invoice": "Add Invoice",
    "btn.scan_invoice": "Scan Invoice",
    "btn.add_payment": "Add Payment",
    "btn.edit": "Edit",
    "btn.delete": "Delete",
    "btn.export": "Export",
    "btn.back": "Back",

    // Messages
    "msg.success": "Operation completed successfully",
    "msg.error": "An error occurred",
    "msg.confirm_delete": "Are you sure you want to delete this item?",
    "msg.no_data": "No data available",

    // Errors
    "error.required_field": "This field is required",
    "error.invalid_amount": "Invalid amount",
    "error.file_too_large": "File is too large",
  },
  es: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.invoices": "Facturas",
    "nav.payments": "Pagos",
    "nav.reports": "Reportes",
    "nav.settings": "Configuración",

    // Payment Types
    "payment_types.cash": "Efectivo",
    "payment_types.card": "Tarjeta",
    "payment_types.transfer": "Transferencia",
    "payment_types.check": "Cheque",
    "payment_types.other": "Otro",

    // Invoice Statuses
    "invoice_statuses.pending": "Pendiente",
    "invoice_statuses.partial": "Parcial",
    "invoice_statuses.paid": "Pagado",

    // Payment Statuses
    "payment_statuses.pending": "Pendiente",
    "payment_statuses.completed": "Completado",
    "payment_statuses.failed": "Fallido",

    // Forms
    "form.vendor_name": "Nombre del Proveedor",
    "form.amount": "Monto",
    "form.currency": "Moneda",
    "form.invoice_date": "Fecha de Factura",
    "form.invoice_number": "Número de Factura (opcional)",
    "form.description": "Descripción",
    "form.payment_date": "Fecha de Pago",
    "form.payment_type": "Tipo de Pago",
    "form.amount_paid": "Monto Pagado",
    "form.status": "Estado",
    "form.notes": "Notas",
    "form.submit": "Enviar",
    "form.cancel": "Cancelar",

    // Buttons
    "btn.add_invoice": "Agregar Factura",
    "btn.scan_invoice": "Escanear Factura",
    "btn.add_payment": "Agregar Pago",
    "btn.edit": "Editar",
    "btn.delete": "Eliminar",
    "btn.export": "Exportar",
    "btn.back": "Atrás",

    // Messages
    "msg.success": "Operación completada con éxito",
    "msg.error": "Ocurrió un error",
    "msg.confirm_delete": "Está seguro que desea eliminar este elemento?",
    "msg.no_data": "No hay datos disponibles",

    // Errors
    "error.required_field": "Este campo es requerido",
    "error.invalid_amount": "Monto inválido",
    "error.file_too_large": "El archivo es demasiado grande",
  },
} as const
