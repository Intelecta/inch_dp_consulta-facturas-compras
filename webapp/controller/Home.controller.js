sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, JsonModel, Fragment,Filter, FilterOperator) {
		"use strict";
		var ZLTDBM_UTILITARIO_SRV;
		var ZLTDBM_REPUESTOS_SRV;
		var that,oThisView;
		var Kondm;
		var Land1;
		var AppId = "0001";
		var DataMarca;
		return Controller.extend("inch_dp_consulta-facturas-compras.controller.Home", {
			onInit: function () {
				that = this;
				oThisView = that.getView();
				ZLTDBM_UTILITARIO_SRV = this.getOwnerComponent().getModel("ZLTDBM_UTILITARIO_SRV");
				ZLTDBM_REPUESTOS_SRV = this.getOwnerComponent().getModel("ZLTDBM_REPUESTOS_SRV");
				this.byId("vbox").setModel(ZLTDBM_REPUESTOS_SRV);				
				this.obtenerUsuarioLogueado();
				//this.obtenerMarcaPais();
				that.onObtenerMarca();   
                that.onGetDealer();
				
			},
			obtenerMarcaPais: function (flag) {

				if (flag) {
					ZLTDBM_UTILITARIO_SRV.read("/marcasSet", {
						success: function (result) {

							var data = that.onDeleteRepeated(result.results);
							localStorage.setItem("marcaPais", JSON.stringify(data));

							if (data.length === 1) {
								var jsonModel = new sap.ui.model.json.JSONModel(data[0]);
								that.getView().setModel(jsonModel, "marcaPais");
								Kondm = data[0].Kondm;
								Land1 = data[0].Land1;
							} else {
								var jsonModel = new sap.ui.model.json.JSONModel(data);
								that.getView().setModel(jsonModel, "marcaPais");
								that.onDialogoVisualizarMarcaPais();
							}

						},
						error: function (err) {

						}
					});
				} else {
					if (localStorage.getItem("marcaPais")) {
						var results = JSON.parse(localStorage.getItem("marcaPais"));
						var jsonModel = new sap.ui.model.json.JSONModel(results);
						that.getView().setModel(jsonModel, "marcaPais");
						if (results.length === 1) {
							var jsonModel = new sap.ui.model.json.JSONModel(results[0]);
							that.getView().setModel(jsonModel, "marcaPais");
							Kondm = results[0].Kondm;
							Land1 = results[0].Land1;
						} else {
							that.onDialogoVisualizarMarcaPais();
						}

					} else {

						ZLTDBM_UTILITARIO_SRV.read("/marcasSet", {
							success: function (result) {

								var data = that.onDeleteRepeated(result.results);
								localStorage.setItem("marcaPais", JSON.stringify(data));
								var jsonModel = new sap.ui.model.json.JSONModel(data);
								that.getView().setModel(jsonModel, "marcaPais");
								if (data.length === 1) {
									var jsonModel = new sap.ui.model.json.JSONModel(data[0]);
									that.getView().setModel(jsonModel, "marcaPais");
									Kondm = data[0].Kondm;
									Land1 = data[0].Land1;
								} else {
									that.onDialogoVisualizarMarcaPais();
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
						that.byId("tNamefb").setText(Fullname);
						that.byId("tName").setText(Fullname);
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
				var indices = that.byId("tbMarcaPais").getSelectedIndices();

				if (indices.length === 0) {
					sap.m.MessageBox.error("Debe seleccionar una marca para continuar");
					return;
				}

				var reg = that.byId("tbMarcaPais").getContextByIndex(indices[0]).getProperty();
				var jsonModel = new sap.ui.model.json.JSONModel(reg);
				Kondm = reg.Kondm;
				Land1 = reg.Land1;
				that.getView().setModel(jsonModel, "marcaPais");
				that.byId("dlgVisualizarMarcaPais").close();
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
				var filter = new sap.ui.model.Filter("Kondm", sap.ui.model.FilterOperator.EQ, DataMarca[0].Kondm.trim());
				filters.push(filter);
				var filter = new sap.ui.model.Filter("Land1", sap.ui.model.FilterOperator.EQ, DataMarca[0].Land1.trim());
				filters.push(filter);                
				var binding = oEvent.getParameter("bindingParams");
				binding.filters = binding.filters.concat(filters);				
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

			},
			onSeleccionarDatosMarca: function(){				
				var indices = that.byId("tbDatosMarca").getSelectedIndices();
				if (indices.length === 0) {
					return;
				}
				var reg = that.byId("tbDatosMarca").getContextByIndex(indices[0]).getProperty();
				var jsonModel = new sap.ui.model.json.JSONModel(reg);				
				that.getView().setModel(jsonModel, "datoMarca");
				that.byId("dlgVisualizarDatosMarca").close();
				var valuedatamarca = [];
				valuedatamarca.push(reg);
				var jsonModelcurrentMarca = new sap.ui.model.json.JSONModel(valuedatamarca);	
				that.getView().setModel(jsonModelcurrentMarca, "DataMarca");
				DataMarca = that.getView().getModel("DataMarca").getData();								
			},
            onObtenerMarca: function(){			
				ZLTDBM_UTILITARIO_SRV.read("/marcasSet", {				
					success: function (result) {
                        
                        if(result.results.length > 0){                      
                        var Datos = {};
                        Datos.aMarcasPais = result.results;
						that.getView().setModel(new JsonModel(result.results), "DataMarca");
						DataMarca = that.getView().getModel("DataMarca").getData();
						var aResults = result.results;					            
                        var jsonModel = new sap.ui.model.json.JSONModel(aResults);
                        var jsonModelMarcaPais = new sap.ui.model.json.JSONModel(Datos);
                        that.getView().setModel(jsonModel, "datosMarca");                          
                        that.byId("idMarca").setModel(jsonModelMarcaPais); 
                        var jsonModel = new sap.ui.model.json.JSONModel(aResults[0]);	
						that.getView().setModel(jsonModel, "datoMarca");
                        }
                        else{
                            var message = "Estimado" +" " +thes.byId("tNamefb").getText() +" " +"usted no cuenta con marcas asociadas";                                                      
                            that.fnabrirdialogmensaje(message);
                        }                        											
					},
					error: function (err) {
	                   
					}
				});
			},
            onDialogoVisualizarDatosMarca: function(){
				var oView = this.getView();				
				if (!this.byId("dlgVisualizarDatosMarca")) {					
					Fragment.load({
						id: oView.getId(),
						controller: this,
						name: "inch_dp_consulta-facturas-compras.fragment.ValueHelpDatosMarca"
					}).then(function (oDialog) {					
						oView.addDependent(oDialog);
						oDialog.open();
					});
				} else {
					this.byId("dlgVisualizarDatosMarca").open();
				}
			},
            onGetDealer: function(){				
				ZLTDBM_UTILITARIO_SRV.read("/DealerSet", {							
					success: function (result) {					
					if(result.results.length>0){
                        	
						var Dealerarray = that.onDeleteDealerRepeated(result.results);
                        var oDatos = {};
                        oDatos.aDealers = Dealerarray;
                        var jsonModel = new sap.ui.model.json.JSONModel(Dealerarray[0]);
                        var jsonModelMatchCode = new sap.ui.model.json.JSONModel(oDatos);                       
                        that.getView().setModel(jsonModelMatchCode, "aDealers");  
                        var Dealer = Dealerarray[0].Partner + " " + "-" + " " + Dealerarray[0].NamePartner;                        
						if (Dealerarray.length == 1) {
							that.byId("idDealers").setEnabled(false);                            
						}
						that.byId("idDealers").setValue(Dealer);
                        that.getView().setModel(jsonModel, "datoDealerCab");						                                       			                      
					}
                    else{
                        var message = "Estimado" +" " +thes.byId("tNamefb").getText() +" " +"usted no cuenta con Dealer asociado";
                        that.fnabrirdialogmensaje(message);
                    }																													
					},
					error: function (err) {

					}
				});
			},
			onDeleteDealerRepeated: function (aResults) {	
				// AppId = 0001 ID para el portal de Inicio										
				var aResultsAux = [];
				var isFound;				
				$.each(aResults, (idx, value) => {				
				isFound = aResultsAux.find(element => element.Partner === value.Partner);				
				if(!isFound){
			     if(value.AppId == AppId){
				 aResultsAux.push(value);
				 }				
				}				
				});				
				return aResultsAux;			
			},
            onDialogoVisualizarDatosDealer: function(){
				var oView = this.getView();				
				if (!this.byId("dlgVisualizarDatosDealer")) {					
					Fragment.load({
						id: oView.getId(),
						controller: this,
						name: "inch_dp_consulta-facturas-compras.fragment.ValueHelpDatosDealer"
					}).then(function (oDialog) {					
						oView.addDependent(oDialog);
						oDialog.open();
					});
				} else {
					this.byId("dlgVisualizarDatosDealer").open();
				}
			},
            onSeleccionarDatosDealer: function(){				
				var indices = that.byId("tbDatosDealer").getSelectedIndices();
				if (indices.length === 0) {
					return;
				}
				var reg = that.byId("tbDatosDealer").getContextByIndex(indices[0]).getProperty();
				var jsonModel = new sap.ui.model.json.JSONModel(reg);				
				that.getView().setModel(jsonModel, "datoDealerCab");
				that.byId("dlgVisualizarDatosDealer").close();                               											
			},
              onMostrarDealers: function (oEvent) {
				var aDealers = that.getView().getModel("aDealers");
				oThisView.setModel(aDealers);
				oThisView.getModel().refresh(true);
				var sInputValue = oEvent.getSource().getValue();
				this.inputId = oEvent.getSource().getId();
				if (!this._valueHelpDialog) {
					this._valueHelpDialog = sap.ui.xmlfragment(
						"inch_dp_consulta-facturas-compras.fragment.ValueHelpDealers",
						this
					);
					this.getView().addDependent(this._valueHelpDialog);
				}               
				this._valueHelpDialog.open();
			},
			onBuscarDealer: function (evt) {
				var aFilter = [];
				var sValue = evt.getParameter("value");
				var oFilter = new Filter("NamePartner", sap.ui.model.FilterOperator.Contains, sValue);
				aFilter.push(oFilter);
				evt.getSource().getBinding("items").filter(aFilter);
			},
			onCerrarMatchCodeDealer: function (evt) {
				var oSelectedItem = evt.getParameter("selectedItem");
				if (oSelectedItem) {                   
					var productInput = this.byId(this.inputId);
					var item = oSelectedItem.getTitle() + " " + "-" + " " + oSelectedItem.getDescription();
					productInput.setValue(item);
					that.byId("idDealers").setValueState("None");
					that.byId("idDealers").setValueStateText("");
                    var dealer = { "Partner": oSelectedItem.getTitle()  , "NamePartner":oSelectedItem.getDescription() }
                    var jsonModel = new sap.ui.model.json.JSONModel(dealer);
                    that.getView().setModel(jsonModel, "datoDealerCab");
                   
				}
				evt.getSource().getBinding("items").filter([]);
			},
			onLeaveMatchCodeDealer: function () {
				var Dealer = that.byId("idDealers").getValue();
				if (Dealer === "") {
					MessageBox.error("Completar todos los campos.");
					that.byId("idDealers").setValueState("Error");
					that.byId("idDealers").setValueStateText("El valor es incorrecto");
					return;
				}
				var idxDealer = oThisView.getModel().getData().aDealers.findIndex(oElemento => oElemento.NamePartner === Dealer);
				if (idxDealer < 0) {
					MessageBox.error("El dealer no existe por favor completar el campo.");
					that.byId("idDealers").setValueState("Error");
					that.byId("idDealers").setValueStateText("El valor es incorrecto");
				} else {
					that.byId("idDealers").setValueState("None");
					that.byId("idDealers").setValueStateText("");
				}

			},
            onchangeMarcaPais: function(oEvent){                
                var SelectedItem = oEvent.getSource().getSelectedKey();
                var keys = SelectedItem.split("-");
                var obj = {"Land1": keys[0], "Landx": keys[1], "Kondm": keys[2], "VtextKondm": keys[3]};
                var jsonModel = new sap.ui.model.json.JSONModel(obj);	
				that.getView().setModel(jsonModel, "datoMarca"); 
                var collection = []; 
                collection.push(obj);
                that.getView().setModel(new JsonModel(collection), "DataMarca");
				DataMarca = that.getView().getModel("DataMarca").getData();                                     
            },
            fnabrirdialogmensaje: function (message) {
                var Dialogo = new sap.m.Dialog({
                    title: "Información"
                });
                var messageStrip1 = new sap.m.MessageStrip({
                    text: message,
                    showIcon: true
                });
               
                Dialogo.addContent(messageStrip1);                
                //Boton para regresar a la página anterior
                Dialogo.addButton(new sap.m.Button({
                    text: "Ok",
                    press: function () {
                        Dialogo.close();
                        history.back();                        
                    }
                }));                
                Dialogo.open();
            },

		});
	});
