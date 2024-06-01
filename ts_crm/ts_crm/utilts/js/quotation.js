frappe.ui.form.on("Quotation", {
	

    refresh: function(frm){


        frappe.call({
            method: 'ts_crm.ts_crm.report.daily_follow_up_status.daily_follow_up_status.get_crm_settings',
            callback: function(r) {
                if (r.message && r.message.show_quotation_filter === 1) {
					frm.set_value('show_followup', 1);
                } else {
                    frm.set_value('show_followup', 0);
                }
            }
        });

		frappe.db.get_value('User', {'name': frappe.session.user}, 'role_profile_name', (r) => {
			if (r.role_profile_name == 'Admin') {
			 cur_frm.fields_dict.items.grid.update_docfield_property('rate','read_only',1)
			} else {
			 cur_frm.fields_dict.items.grid.update_docfield_property('rate','read_only',0)
			}
		   });
		if(['Ordered','Lost'].includes(frm.doc.status)){
			frm.set_df_property('custom_followup', 'read_only', 1);
		}
		else{
			frm.set_df_property('custom_followup', 'read_only',0);
		}
		setTimeout(() => {
			frm.remove_custom_button("Set as Lost");
			frm.remove_custom_button('Sales Order',"Create");
			frm.remove_custom_button("Opportunity", "Get Items From");
		}, 100)

		frm.set_query("custom_quotation_owner", function () {
			return {
				filters: {
					enabled: 1,
				},
			};
		});

		frm.set_query("custom_project_location", function () {
			return {
				filters: {
					is_group: 0,
				},
			};
		});

		frm.set_query('custom_item_group',function(frm){
			return {
				filters:{
					'is_group':0,
				}
			}
		});

		// frm.set_query('item_code',"items", function(doc){
		// 	if (frm.doc.custom_item_group){
		// 		return {
		// 			query:"global_safety_enterprises.global_safety_enterprises.utils.py.quotation.item_query",
		// 			filters:{
		// 				'parent_item_group':frm.doc.custom_item_group,
		// 			}
		// 		}
		// 	}
		// })
    },

	custom_margin_: function(frm){

		if (frm.doc.custom_margin_ >= 0){

			for (var i = 0; i < (frm.doc.items).length; i++){

				frappe.model.set_value(frm.doc.items[i].doctype, frm.doc.items[i].name, "custom_ts_margin", frm.doc.custom_margin_)

			}
		}
		else{

			frm.set_value("custom_margin_", 0)

			frappe.show_alert({message: "Margin (%) Must Be Postive Number.", indicator: 'red'});
		}
	},
	custom_ts_status:function(frm){
		cur_frm.set_value('status',frm.doc.custom_ts_status)
		cur_frm.set_value('custom_status_updated',1)
		
	},
	custom_view_follow_up_details: function(frm){
		let data=`<table style="font-size:14px; border:1px solid black;width:100%">

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
		frm.doc.custom_followup.forEach(row => {
			data += `
			<tr style="border:1px solid black; padding:5px;">
				<td style="border:1px solid black; padding:5px;">
				<center>
					${row.idx || ""}
				</center>
				</td>
				<td style="border:1px solid black; padding:5px;">
				<center>
					${frappe.format(row.date, {fieldtype:'Date'})}
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
			size:"extra-large",
			fields : [
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

frappe.ui.form.on("Quotation Item", {

	custom_ts_margin: function(frm, cdt, cdn){

		var data = locals[cdt][cdn]

		if (data.custom_ts_margin >= 0){

			frappe.model.set_value(cdt, cdn, "discount_amount", 0)
			frappe.model.set_value(cdt, cdn, "margin_type", "Percentage")
			frappe.model.set_value(cdt, cdn, "margin_rate_or_amount", data.custom_ts_margin)
		}
		else{

			frappe.model.set_value(cdt, cdn, "custom_ts_margin", 0)

			frappe.show_alert({message: "Margin (%) Must Be Postive Number, In Row <b>" + data.idx + "</b>.", indicator: 'red'});
		}

	},

	item_code: function(frm, cdt, cdn){

		setTimeout(() => {

			frappe.model.set_value(cdt, cdn, "custom_ts_margin", frm.doc.custom_margin_)

		}, 200);
	},

	rate: function(frm, cdt, cdn){

		var data = locals[cdt][cdn]

		if (data.rate < 0){

			frappe.model.set_value(cdt, cdn, "rate", data.price_list_rate)

			frappe.show_alert({message: "Rate Must Be Postive Number, In Row <b>" + data.idx + "</b>, So Default Purchase Rate Is Set.", indicator: 'red'});
		}

	}
})

frappe.ui.form.on("Follow-Up", {
	date:function(frm,cdt,cdn){
		let row = locals[cdt][cdn]
		if(row.date){
		for (var i in cur_frm.doc.custom_followup) {
			var value = cur_frm.doc.custom_followup[i]
			if (row.idx == value.idx){
				break
			}
			if(row.date < value.date){
				frappe.show_alert({message:`Row - ${row.idx} Date (<span style='color:red'>${moment(row.date).format('DD-MM-YYYY')}</span>) should not be earlier than Row - ${value.idx} Date (<span style='color:red'>${moment(value.date).format('DD-MM-YYYY')}</span>)`, indicator:'red'})
				row.date = ''
				break
			}
		}
	}

	},
	next_follow_up_date:function(frm,cdt,cdn){
		let row = locals[cdt][cdn]
		if(row.next_follow_up_date < row.date){
			frappe.show_alert({message:`Follow Up Date - <span style='color:red'>${moment(row.next_follow_up_date).format('DD-MM-YYYY')}</span> should not be earlier than Date -<span style='color:red'> ${moment(row.date).format('DD-MM-YYYY')}</span>`,indicator:'red'})
			row.next_follow_up_date = ''
		}
	},
	status:function(frm,cdt,cdn){
		let row = locals[cdt][cdn]
		if(row.status == 'Do Not Disturb'){
			cur_frm.set_value('custom_status_updated',0)
		}
		else{
			cur_frm.set_value('custom_status_updated',1)
		}
	}
})