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
import { titleToCamelCase } from './utils/functions';

export default function BasicTable({
	headings,
	props,
	rows,
	rowKey,
	onSetRows,
	tableName,
}) {
	const handleSave = (formData) => {
		fetch(
			`http://localhost:8000/${titleToCamelCase(tableName)}/${formData.id}`,
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			}
		).then(() => {
			onSetRows(formData);
		});
	};

	return (
		<>
			<TableContainer component={Paper}>
				<Table aria-label="simple table">
					<TableHead>
						<TableRow>
							{headings.map((heading, i) => (
								<TableCell key={heading + '_' + i}>
									<b>{heading}</b>
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{rows.map((row) => (
							<TableRow key={row[rowKey]}>
								{props.map((prop, i) => (
									<TableCell key={row[prop] + '_' + i}>{row[prop]}</TableCell>
								))}
								<TableCell key="edit">
									<EditButton
										headings={headings}
										props={props}
										row={row}
										onHandleSave={handleSave}
									/>
								</TableCell>
								<TableCell key="delete">
									<Button variant="outlined">Delete</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</>
	);
}
