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
import brazilStates from './data/brazilStates.json';
import { generateRandomString } from './utils/functions';

function EditToolbar(props) {
	const { setRows, setRowModesModel } = props;

	const handleClick = () => {
		const customer_id = generateRandomString();
		setRows((oldRows) => [
			{
				customer_id,
				customer_unique_id: generateRandomString(),
				customer_zip_code_prefix: '69930',
				customer_city: 'xapuri',
				customer_state: brazilStates[0],
			},
			...oldRows,
		]);

		setRowModesModel((oldModel) => ({
			...oldModel,
			[customer_id]: {
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

	React.useEffect(() => {
		setRows(tableData);
	}, [tableData]);

	const handleEditClick = (id) => () => {
		setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
	};

	const handleSaveClick = (id) => () => {
		setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
	};

	const handleDeleteClick = (id) => async () => {
		try {
			// Make the HTTP request (example using fetch)
			const response = await fetch(
				`http://localhost:8000/delete-record?customerId=${id}`,
				{
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ customerId: id }),
				}
			);

			if (!response.ok) {
				throw new Error(`Failed to delete record: ${response.statusText}`);
			}
			setRows(rows.filter((row) => row.customer_id !== id));
		} catch (error) {
			console.error('Error deleting record:', error);
		}
	};

	const handleCancelClick = (id) => () => {
		setRowModesModel({
			...rowModesModel,
			[id]: { mode: GridRowModes.View, ignoreModifications: true },
		});

		const editedRow = rows.find((row) => row.customer_id === id);
		if (editedRow.isNew) {
			setRows(rows.filter((row) => row.customer_id !== id));
		}
	};

	const processRowUpdate = async (newRow) => {
		// Find the original row
		const originalRow = rows.find(
			(row) => row.customer_id === newRow.customer_id
		);

		// Determine what fields were updated
		const changes = {};
		Object.keys(newRow).forEach((key) => {
			if (newRow[key] !== originalRow[key]) {
				changes[key] = { oldValue: originalRow[key], newValue: newRow[key] };
			}
		});

		// Log the changes

		// Prepare the payload for the HTTP request
		const updatePayload = {
			customerId: newRow.customer_id, // Use the customer_id for the backend lookup
			customerUniqueId: newRow.customer_unique_id,
			zipCodePrefix: newRow.customer_zip_code_prefix || undefined,
			city: newRow.customer_city || undefined,
			state: newRow.customer_state || undefined,
		};

		try {
			// Make the HTTP request (example using fetch)
			const response = await fetch(`http://localhost:8000/update-record`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(updatePayload),
			});

			if (!response.ok) {
				throw new Error(`Failed to update record: ${response.statusText}`);
			}

			// If the request succeeds, update the row in the state
			const updatedRow = { ...newRow, isNew: false };
			setRows(
				rows.map((row) =>
					row.customer_id === newRow.customer_id ? updatedRow : row
				)
			);
			return updatedRow;
		} catch (error) {
			console.error('Error updating record:', error);

			// Optionally, revert the change in the UI if the update fails
			return originalRow;
		}
	};

	const handleRowModesModelChange = (newRowModesModel) => {
		setRowModesModel(newRowModesModel);
	};

	const columns = [
		{ field: 'customer_id', headerName: 'ID', width: 180, editable: false },
		{
			field: 'customer_unique_id',
			headerName: 'Unique Id',
			editable: false,
			flex: 1,
		},
		{
			field: 'customer_zip_code_prefix',
			headerName: 'Zip Code Prefix',
			align: 'left',
			headerAlign: 'left',
			type: 'number',
			editable: true,
			flex: 1,
		},
		{
			field: 'customer_state',
			headerName: 'State',
			editable: true,
			type: 'singleSelect',
			valueOptions: brazilStates,
			flex: 1,
		},
		{
			field: 'customer_city',
			headerName: 'City',
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
							key="save"
							icon={<SaveIcon />}
							label="Save"
							sx={{
								color: 'primary.main',
							}}
							onClick={handleSaveClick(id)}
						/>,
						<GridActionsCellItem
							key="cancel"
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
						key="edit"
						icon={<EditIcon />}
						label="Edit"
						className="textPrimary"
						onClick={handleEditClick(id)}
						color="inherit"
					/>,
					<GridActionsCellItem
						key="delete"
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
				getRowId={(row) => row.customer_id}
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
