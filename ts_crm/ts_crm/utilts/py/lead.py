from frappe import _

def validate(doc, method):
    if doc.custom_view_follow_up_details_copy:
        last_followup = doc.custom_view_follow_up_details_copy[-1] 
        if last_followup.status:
            doc.status = last_followup.status