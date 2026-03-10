export const pvcChecklistItems = [
	'Colocacion marco',
	'Colocacion hoja',
	'Colocacion vidrio',
	'Colocacion herrajes y trabas',
	'Colocacion poliuretano',
	'Colocacion cuarta caña',
];

export const aluminioChecklistNames = [
	'Colocacion marco',
	'Colocacion hoja',
	'Colocacion vidrio',
	'Colocacion herrajes y trabas',
	'Sellado marco',
	'Sellado vidrio',
	'Accesorios',
	'Herrajes',
];

export const persianasChecklistNames = [
	'Corroborar medidas de cortina',
	'Colocar guías',
	'Colocar planchuelas',
	'Medir para corroborar rollo',
	'Colocar el paño',
	'Regular persiana',	
	'Probar funcionamiento',
]

export const portonesChecklistNames = [
	'Corroborar medida (que entre dentro de la hoja)',
	'Amurar',
	'Contrapesar',
	'Sellar',
	'Automatizar (corte arriba y corte abajo)',
]

export const mamparasChecklistNames = [
	'Corroborar si pasa algún caño antes de perforar',
	'Cortar perfilería (umbral, dintel, lateral)',
	'Amurar perfiles',
	'Montar herrajes',
	'Montar vidrios',
]

export const vidrioChecklistNames = [
	'Corroborar medidas',
	'Colocar calzo',
	'Montar',
	'Colocar vidrio',
	'Sellar'
]

export const checklistTypes = {
	PVC: 'PVC',
	Aluminio: 'Aluminio',
	Persiana: 'Persiana',
	Porton: 'Porton',
	Mampara: 'Mampara',
	Vidrio: 'Vidrio',
} as const;

export type ChecklistType = typeof checklistTypes[keyof typeof checklistTypes];

export const getItemsForChecklistType = (type: keyof typeof checklistTypes) => {
	switch (type) {
		case 'PVC':
			return pvcChecklistItems;
		case 'Aluminio':
			return aluminioChecklistNames;
		case 'Persiana':
			return persianasChecklistNames;
		case 'Porton':
			return portonesChecklistNames;
		case 'Mampara':
			return mamparasChecklistNames;
		case 'Vidrio':
			return vidrioChecklistNames;
		default:
			return [];
	}
};