import json
import os

def after_migrate():
	create_custom_fields()

def create_custom_fields():
	CUSTOM_FIELDS = {}
	print("Creating/Updating Custom Fileds ....")

	path = os.path.join(os.path.dirname(__file__), "ts_crm/custom_fields")
	for file in os.listdir(path):
		with open(os.path.join(path, file), "r") as f:
			CUSTOM_FIELDS.update(json.load(f))
	from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

	create_custom_fields(CUSTOM_FIELDS)

