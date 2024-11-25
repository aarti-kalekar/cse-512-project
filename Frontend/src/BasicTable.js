import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button } from '@mui/material';
import EditButton from './EditButton';
import { DeleteButton } from './DeleteButton';

export default function BasicTable({
	headings,
	props,
	rows,
	rowKey,
	onSetRows,
	onDeleteRow,
	tableName,
}) {
	const handleSave = (formData) => {
		fetch(`http://localhost:8000/${tableName}/${formData.id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(formData),
		})
			.then(() => {
				onSetRows(formData);
			})
			.catch((error) => console.error('Error:', error));
	};

	const handleDelete = (id) => {
		fetch(`http://localhost:8000/${tableName}/${id}`).then(() => {
			onDeleteRow(id);
		});
	};

	return (
		<TableContainer component={Paper}>
			<Table aria-label="simple table">
				<TableHead>
					<TableRow>
						{headings.map((heading, i) => (
							<TableCell key={`${tableName}-${heading}-${i}`}>
								<b>{heading}</b>
							</TableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{rows.map((row) => (
						<TableRow key={`${tableName}-${row[rowKey]}`}>
							{props.map((prop, i) => (
								<TableCell key={`${row[prop]}-${tableName}-${i}`}>
									{row[prop]}
								</TableCell>
							))}
							<TableCell key={`edit-${tableName}-${row[rowKey]}`}>
								<EditButton
									headings={headings}
									props={props}
									row={row}
									onHandleSave={handleSave}
									tableName={tableName}
								/>
							</TableCell>
							<TableCell key={`delete-${tableName}-${row[rowKey]}`}>
								<DeleteButton onHandleDelete={handleDelete} row={row} />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
