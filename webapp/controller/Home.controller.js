sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, JsonModel, Fragment) {
		"use strict";
		var ZLTDBM_UTILITARIO_SRV;
		var ZLTDBM_REPUESTOS_SRV;
		var thes;
		var Kondm;
		var Land1;
		return Controller.extend("inch_dp_consulta-facturas-compras.controller.Home", {
			onInit: function () {

				thes = this;
				ZLTDBM_UTILITARIO_SRV = this.getOwnerComponent().getModel("ZLTDBM_UTILITARIO_SRV");
				ZLTDBM_REPUESTOS_SRV = this.getOwnerComponent().getModel("ZLTDBM_REPUESTOS_SRV");
				this.byId("vbox").setModel(ZLTDBM_REPUESTOS_SRV);
				this.obtenerMarcaPais();
				this.obtenerUsuarioLogueado();
				//this.rangoFecha();
			},

			// rangoFecha: function () {
			// 	var date = new Date();
			// 	var data = {
			// 		fechaIni: ((new Date(date.getFullYear(), date.getMonth(), 1)).getTime()).toString(),
			// 		fechaHoy: ((new Date()).getTime()).toString()
			// 	};
			// 	var jsonModel = new sap.ui.model.json.JSONModel(data);
			// 	thes.byId("vbox").setModel(jsonModel, "rangoFecha");

			// },

			obtenerMarcaPais: function (flag) {

				if (flag) {
					ZLTDBM_UTILITARIO_SRV.read("/marcasSet", {
						success: function (result) {

							var data = thes.onDeleteRepeated(result.results);
							localStorage.setItem("marcaPais", JSON.stringify(data));

							if (data.length === 1) {
								var jsonModel = new sap.ui.model.json.JSONModel(data[0]);
								thes.getView().setModel(jsonModel, "marcaPais");
								Kondm = data[0].Kondm;
								Land1 = data[0].Land1;
							} else {
								var jsonModel = new sap.ui.model.json.JSONModel(data);
								thes.getView().setModel(jsonModel, "marcaPais");
								thes.onDialogoVisualizarMarcaPais();
							}

						},
						error: function (err) {

						}
					});
				} else {
					if (localStorage.getItem("marcaPais")) {
						var results = JSON.parse(localStorage.getItem("marcaPais"));
						var jsonModel = new sap.ui.model.json.JSONModel(results);
						thes.getView().setModel(jsonModel, "marcaPais");
						if (results.length === 1) {
							var jsonModel = new sap.ui.model.json.JSONModel(results[0]);
							thes.getView().setModel(jsonModel, "marcaPais");
							Kondm = results[0].Kondm;
							Land1 = results[0].Land1;
						} else {
							thes.onDialogoVisualizarMarcaPais();
						}

					} else {

						ZLTDBM_UTILITARIO_SRV.read("/marcasSet", {
							success: function (result) {

								var data = thes.onDeleteRepeated(result.results);
								localStorage.setItem("marcaPais", JSON.stringify(data));
								var jsonModel = new sap.ui.model.json.JSONModel(data);
								thes.getView().setModel(jsonModel, "marcaPais");
								if (data.length === 1) {
									var jsonModel = new sap.ui.model.json.JSONModel(data[0]);
									thes.getView().setModel(jsonModel, "marcaPais");
									Kondm = data[0].Kondm;
									Land1 = data[0].Land1;
								} else {
									thes.onDialogoVisualizarMarcaPais();
								}
							},
							error: function (err) {

							}
						});
					}
				}

			},

			obtenerUsuarioLogueado: function () {
				var sPrefix = this.getOwnerComponent().getModel("UserLogged").sServiceUrl;
				$.ajax(sPrefix + "/currentUser", {
					type: "GET",
					async: false,
					dataType: "json",
					success: function (response) {
						var Fullname = response.firstname + " " + response.lastname;
						thes.byId("tNamefb").setText(Fullname);
						thes.byId("tName").setText(Fullname);
					},
					error: function (error) {
						sap.m.MessageToast.show("No se ha podido obtener los datos del usuario");
					}
				});
			},

			onDialogoVisualizarMarcaPais: function () {

				var oView = this.getView();

				// create dialog lazily
				if (!this.byId("dlgVisualizarMarcaPais")) {
					// load asynchronous XML fragment
					Fragment.load({
						id: oView.getId(),
						controller: this,
						name: "inch_dp_consulta-facturas-compras.view.ValueHelpMarcaPais"
					}).then(function (oDialog) {
						// connect dialog to the root view of this component (models, lifecycle)
						oView.addDependent(oDialog);
						oDialog.open();
					});
				} else {
					this.byId("dlgVisualizarMarcaPais").open();
				}

			},

			onSeleccionarMarcaPais: function () {
				var indices = thes.byId("tbMarcaPais").getSelectedIndices();

				if (indices.length === 0) {
					sap.m.MessageBox.error("Debe seleccionar una marca para continuar");
					return;
				}

				var reg = thes.byId("tbMarcaPais").getContextByIndex(indices[0]).getProperty();
				var jsonModel = new sap.ui.model.json.JSONModel(reg);
				Kondm = reg.Kondm;
				Land1 = reg.Land1;
				thes.getView().setModel(jsonModel, "marcaPais");
				thes.byId("dlgVisualizarMarcaPais").close();
			},

			onDeleteRepeated: function (aResults) {
				var aResultsAux = [];
				var isFound;
				$.each(aResults, (idx, value) => {
					isFound = aResultsAux.find(element =>
						element.Kondm === value.Kondm &&
						element.Land1 === value.Land1
					);
					if (!isFound) {
						aResultsAux.push(value);
					}
				});
				return aResultsAux;
			},

			onCancelar: function (oEvent) {
				var id = oEvent.getSource().data("id");
				this.byId(id).close();
			},

			onEditarCabecera: function () {

				this.obtenerMarcaPais();
				this.onDialogoVisualizarMarcaPais();

			},

			onbrtconsultaFacturas: function (oEvent) {
				var filters = [];
				var filter = new sap.ui.model.Filter("Kondm", sap.ui.model.FilterOperator.EQ, Kondm);
				filters.push(filter);
				var filter = new sap.ui.model.Filter("Land1", sap.ui.model.FilterOperator.EQ, Land1);
				filters.push(filter);

				for (var i = 0; i < oEvent.getParameter("bindingParams").filters.length; i++) {

					if (oEvent.getParameter("bindingParams").filters[i].sPath !== "Kondm" && oEvent.getParameter("bindingParams").filters[i].sPath !== "Land1") {

						filters.push(oEvent.getParameter("bindingParams").filters[i]);

					}

				}

				var binding = oEvent.getParameter("bindingParams");
				binding.filters = filters;
			},

			hexToBase64: function (hexstring) {
				return btoa(hexstring.match(/\w{2}/g).map(function (a) {
					return String.fromCharCode(parseInt(a, 16));
				}).join(""));
			},

			onVerFactura: function (oEvent) {

				var indices = this.byId("stconsultaFacturas").getTable().getSelectedIndices();

				if (indices.length === 0) {
					return;
				}

				var reg = this.byId("stconsultaFacturas").getTable().getContextByIndex(indices[0]).getProperty();


				if (!reg.LinkPdf) {
					return;
				}

				var datos = this.hexToBase64(reg.LinkPdf);
				var objbuilder = '';
				objbuilder += ('<object width="100%" height="100%" data="data:application/pdf;base64,');
				objbuilder += (datos);
				objbuilder += ('" type="application/pdf" class="internal">');
				objbuilder += ('<embed src="data:application/pdf;base64,');
				objbuilder += (datos);
				objbuilder += ('" type="application/pdf" />');
				objbuilder += ('</object>');
				var win = window.open("#", "_blank");
				var title = "PDF";
				win.document.write('<html><title>' + title +
					'</title><body style="margin-top:0px; margin-left: 0px; margin-right: 0px; margin-bottom: 0px;">');
				win.document.write(objbuilder);
				win.document.write('</body></html>');

			}

		});
	});
