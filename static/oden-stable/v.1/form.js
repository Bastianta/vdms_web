/*
	JS-Oden-Stable V.1
	Update : 2025-05-19
	Common Library - form.js
		Update : 
			- New Layouting Oden (Form)
*/

class Form {
	SimpleForm(id,elements,rulesNow, customParam){
		/**
			* Fungsi ini untuk membuat tampilan form.
			* @param {string} id - ID Object Form.
			* @param {list / array} elements - element" yang ada didalam Form.
			* @param {dictionary / Object} rulesNow - rules dengan format bawaan Webix.
			* @return {dictionary / Object} form1
		*/
		
		let customWidthParam = undefined	// tambahan variable untuk autoLayout
		if(customParam!=undefined){
			customWidthParam = customParam['CUSTOM_WIDTH'] // "full" / static (ex:1000) / tidak perlu ada customParam
		}
		let form1 = {
			view:"form", 
			id:id,
			customWidthParam:customWidthParam, // tambahan attribute untuk autoLayout
			elements:elements,
			rules:rulesNow,
			margin:1,
			on: {
				onValidationError(key, obj){
					if(!validationErrorForm.includes(key)){
						validationErrorForm.push(key)
					}
				},
				onBeforeValidate(){
					window.validationErrorForm = []
				},
				onViewShow:function(){
					if(winMultiviewBlocksVertical.includes(id)){
						if($$(id).$height<460){
							winHeightMultiview[id] = 460
						}else{
							winHeightMultiview[id] = this.$height
						}
					}
				},
			}
		}
		window.winCountOffsetRecord[id] = 0
		window.winDataCompare[id] = {}
		window.winDataCompare[id]['data'] = {}
		if(winConfigForm[id]!=undefined){
			if(winConfigForm[id]["BLOCK_TYPE"][1] == "SUB_PARENT"){
				window.winSubParent.push(id)
			}
		}
		return form1
	}
}

let form = new Form()