import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {
	GridRowModes,
	DataGrid,
	GridToolbarContainer,
	GridActionsCellItem,
	GridRowEditStopReasons,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { customers } from './data/customers';
import brazilStates from './data/brazilStates.json';
import { generateRandomString } from './utils/functions';
const initialRows = customers;

function EditToolbar(props) {
	const { setRows, setRowModesModel } = props;

	const handleClick = () => {
		const customer_unique_id = generateRandomString();
        console.log(customer_unique_id);
		setRows((oldRows) => [
			{
				customer_unique_id,
				customer_id: generateRandomString(),
				customer_zip_code_prefix: '',
				city: '',
				state: true,
			},
			...oldRows,
		]);
		setRowModesModel((oldModel) => ({
			...oldModel,
			[customer_unique_id]: {
				mode: GridRowModes.Edit,
				fieldToFocus: 'customer_zip_code_prefix',
			},
		}));
	};

	return (
		<GridToolbarContainer>
			<Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
				Add record
			</Button>
		</GridToolbarContainer>
	);
}

export default function FullFeaturedCrudGrid({ tableData }) {
	const [rows, setRows] = React.useState(tableData);
	const [rowModesModel, setRowModesModel] = React.useState({});

	const handleRowEditStop = (params, event) => {
		if (params.reason === GridRowEditStopReasons.rowFocusOut) {
			event.defaultMuiPrevented = true;
		}
	};

	const handleEditClick = (id) => () => {
		setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
	};

	const handleSaveClick = (id) => () => {
		setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
	};

	const handleDeleteClick = (id) => () => {
		setRows(rows.filter((row) => row.customer_unique_id !== id));
	};

	const handleCancelClick = (id) => () => {
		setRowModesModel({
			...rowModesModel,
			[id]: { mode: GridRowModes.View, ignoreModifications: true },
		});

		const editedRow = rows.find((row) => row.customer_unique_id === id);
		if (editedRow.isNew) {
			setRows(rows.filter((row) => row.customer_unique_id !== id));
		}
	};

	const processRowUpdate = (newRow) => {
		const updatedRow = { ...newRow, isNew: false };
		setRows(
			rows.map((row) =>
				row.customer_unique_id === newRow.customer_unique_id ? updatedRow : row
			)
		);
		return updatedRow;
	};

	const handleRowModesModelChange = (newRowModesModel) => {
		setRowModesModel(newRowModesModel);
	};

	const columns = [
		{ field: 'customer_id', headerName: 'ID', width: 180, editable: true },
		{
			field: 'customer_unique_id',
			headerName: 'Unique Id',
			// type: 'number',
			// width: 80,
			// align: 'left',
			// headerAlign: 'left',
			editable: true,
			flex: 1,
		},
		{
			field: 'zip_code_prefix',
			headerName: 'Zip Code Prefix',
			align: 'left',
			headerAlign: 'left',
			type: 'number',
			// width: 180,
			editable: true,
			flex: 1,
		},
		{
			field: 'state',
			headerName: 'State',
			// width: 220,
			editable: true,
			type: 'singleSelect',
			valueOptions: brazilStates,
			flex: 1,
		},
		{
			field: 'city',
			headerName: 'City',
			// width: 220,
			editable: true,
			flex: 1,
		},
		{
			field: 'actions',
			type: 'actions',
			headerName: 'Actions',
			width: 100,
			cellClassName: 'actions',
			flex: 1,
			getActions: ({ id }) => {
				const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

				if (isInEditMode) {
					return [
						<GridActionsCellItem
							icon={<SaveIcon />}
							label="Save"
							sx={{
								color: 'primary.main',
							}}
							onClick={handleSaveClick(id)}
						/>,
						<GridActionsCellItem
							icon={<CancelIcon />}
							label="Cancel"
							className="textPrimary"
							onClick={handleCancelClick(id)}
							color="inherit"
						/>,
					];
				}

				return [
					<GridActionsCellItem
						icon={<EditIcon />}
						label="Edit"
						className="textPrimary"
						onClick={handleEditClick(id)}
						color="inherit"
					/>,
					<GridActionsCellItem
						icon={<DeleteIcon />}
						label="Delete"
						onClick={handleDeleteClick(id)}
						color="inherit"
					/>,
				];
			},
		},
	];

	return (
		<Box
			sx={{
				height: 500,
				width: '100%',
				'& .actions': {
					color: 'text.secondary',
				},
				'& .textPrimary': {
					color: 'text.primary',
				},
			}}
		>
			<DataGrid
				getRowId={(row) => row.customer_unique_id}
				rows={rows}
				columns={columns}
				editMode="row"
				rowModesModel={rowModesModel}
				onRowModesModelChange={handleRowModesModelChange}
				onRowEditStop={handleRowEditStop}
				processRowUpdate={processRowUpdate}
				slots={{ toolbar: EditToolbar }}
				slotProps={{
					toolbar: { setRows, setRowModesModel },
				}}
			/>
		</Box>
	);
}
