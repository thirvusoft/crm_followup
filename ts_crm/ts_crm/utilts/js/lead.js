{% include "india_compliance/gst_india/client_scripts/party.js" %}

frappe.ui.form.on("Lead", {
	refresh: async function (frm) {

		india_compliance.set_state_options(frm);

		setTimeout(() => {

			frm.remove_custom_button("Customer", "Create");
			frm.remove_custom_button("Opportunity", "Create");
			frm.remove_custom_button("Quotation", "Create");
			frm.remove_custom_button("Prospect", "Create");
			frm.remove_custom_button("Add to Prospect", "Action");

			$("[data-doctype='Prospect']").hide();
			$("[data-doctype='Quotation']").hide();

		}, 100)

		frm.set_query("lead_owner", function () {
			return {
				filters: {
					enabled: 1,
				},
			};
		});

		if (!frm.doc.__islocal) {

			if (['Open', "Replied"].includes(frm.doc.status)) {
				frm.add_custom_button(__('<p style="color: #171717; padding-top:8px;padding-left:10px;padding-right:10px;"><b>Create Opportunity</b></p>'), () => {

					frappe.model.open_mapped_doc({
						method: "erpnext.crm.doctype.lead.lead.make_opportunity",
						frm: frm
					});

				});
			}
			if (['Quotation Created', 'Replied', 'Opportunity Open', 'Opportunity Closed', 'Do Not Disturb'].includes(frm.doc.status)) {
				frm.add_custom_button(__('<b style="color:#fc6126">Reopen Lead</b>'), () => {
					frm.set_value('custom_reopen', 1)
					frm.set_value('status', 'Open')
					frm.save()

				});
			}
		}

	},
	// onload:function(frm){

	//     frappe.ui.form.LeadController =  class LeadController extends frappe.ui.form.AddressQuickEntryForm{
	//             guess_default_party() {
	//                 const doc = cur_frm && cur_frm.doc;
	//                 if (!doc) return;
	//                 if (
	//                     ![
	//                         ...frappe.boot.sales_doctypes,
	//                         ...frappe.boot.purchase_doctypes,
	//                         "Customer",
	//                         'Lead',
	//                         "Supplier",
	//                         "Company",
	//                     ].includes(doc.doctype)
	//                 )
	//                     return;


	//                 let party_type = doc.doctype;
	//                 let party = doc.name;


	//                 if (frappe.dynamic_link && frappe.dynamic_link.doc === doc) {
	//                     party_type = frappe.dynamic_link.doctype;
	//                     party = frappe.dynamic_link.doc[frappe.dynamic_link.fieldname];
	//                 }


	//                 return {
	//                     party_type: party_type,
	//                     party: party,
	//                 };
	//             }
	//         };
	//         frappe.ui.form.AddressQuickEntryForm = frappe.ui.form.LeadController
	//   },

	custom_view_follow_up_details: function (frm) {
		let data = `<table style="font-size:14px; border:1px solid black;width:100%">

			<tr style="font-weight:bold; border:1px solid black; padding:5px;">
				<td style="border:1px solid black; padding:5px;">
				<center>
				    S.No
				</center>
				</td>
				<td style="border:1px solid black; padding:5px;">
				<center>
					Date
				</center>
				</td>
				<td style="border:1px solid black; padding:5px;">
				<center>
					Mode of Communication
				</center>
				</td>
				<td style="border:1px solid black; padding:5px;">
				<center>
					Followed By
				</center>
				</td>
				<td style="border:1px solid black; padding:5px;">
				<center>
					Description
				</center>
				</td>
			</tr>
		`
		frm.doc.custom_view_follow_up_details_copy.forEach(row => {
			data += `
			<tr style="border:1px solid black; padding:5px;">
				<td style="border:1px solid black; padding:5px;">
				<center>
					${row.idx || ""}
				</center>
				</td>
				<td style="border:1px solid black; padding:5px;">
				<center>
					${frappe.format(row.date, { fieldtype: 'Date' })}
				</center>
				</td>
				<td style="border:1px solid black; padding:5px;">
				<center>
					${row.mode_of_communication || ""}
				</center>
				</td>
				<td style="border:1px solid black; padding:5px;">
				<center>
					${row.user_name || ""}
				</center>
				</td>
				<td style="border:1px solid black; padding:5px;">
				<center>
					${row.description || ""}
				</center>
				</td>
			</tr>
			`
		})
		data += `</table>`
		var d = new frappe.ui.Dialog({
			title: __("Follow Up Details"),
			size: "extra-large",
			fields: [
				{
					fieldname: 'html_data',
					fieldtype: "HTML"
				}
			]

		})
		d.show();
		$(d.get_field('html_data').wrapper).html(data)
	}
})

frappe.ui.form.on("Follow-Up", {
	date: function (frm, cdt, cdn) {
		let row = locals[cdt][cdn]
		if (row.date) {
			for (var i in cur_frm.doc.custom_view_follow_up_details_copy) {
				var value = cur_frm.doc.custom_view_follow_up_details_copy[i]
				if (row.idx == value.idx) {
					break
				}
				if (row.date < value.date) {
					frappe.show_alert({ message: `Row - ${row.idx} Date (<span style='color:red'>${moment(row.date).format('DD-MM-YYYY')}</span>) should not be earlier than Row - ${value.idx} Date (<span style='color:red'>${moment(value.date).format('DD-MM-YYYY')}</span>)`, indicator: 'red' })
					row.date = ''
					break
				}
			}
		}
	},
	next_follow_up_date: function (frm, cdt, cdn) {
		let row = locals[cdt][cdn]
		if (row.next_follow_up_date < row.date) {
			frappe.show_alert({ message: `Follow Up Date - <span style='color:red'>${moment(row.next_follow_up_date).format('DD-MM-YYYY')}</span> should not be earlier than Date -<span style='color:red'> ${moment(row.date).format('DD-MM-YYYY')}</span>`, indicator: 'red' })
			row.next_follow_up_date = ''
		}
	}
})
