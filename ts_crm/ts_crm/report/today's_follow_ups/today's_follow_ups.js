// Copyright (c) 2023, Thirvusoft and contributors
// For license information, please see license.txt

frappe.query_reports["Today's Follow Ups"] = {
	"filters": [
		{
			fieldname: 'date',
			label: 'Date',
			fieldtype: 'Date',
			default: 'Today',
			reqd: 1
		},
		{
			fieldname: 'user',
			label: 'Follow Up By',
			fieldtype: 'Autocomplete',
			options: []
		},
		{
			fieldname: 'lead',
			label: 'Lead',
			fieldtype: 'Check',
			default: 1
		},
	],

	onload: function(report){

		frappe.db.get_value("User", {"name": frappe.session.user}, "username", (r) => {
			frappe.query_report.set_filter_value('user', r.username);
		})

		frappe.call({

			method: "ts_crm.ts_crm.report.today's_follow_ups.today's_follow_ups.get_user_list",

			args: {user: frappe.session.user},

			callback(r){

				if ((r.message).length < 2){
					frappe.query_report.page.fields_dict.user.df.hidden = 1;
				}
				
				frappe.query_report.page.fields_dict.user.set_data(r.message);
				frappe.query_report.page.fields_dict.user.refresh();
			}
		})

	}
};
frappe.call({
    method: 'ts_crm.ts_crm.report.daily_follow_up_status.daily_follow_up_status.get_crm_settings',
    callback: function(r) {
        var showQuotationFilter = r.message.show_quotation_filter;
        if (showQuotationFilter) {
            frappe.query_reports["Today's Follow Ups"].filters.push({
                fieldname: 'quotation',
                label: 'Quotation',
                fieldtype: 'Check',
                default: 1 // Assuming you want it checked by default
            });
        }
    }
});