import * as React from 'react';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Modal, TextField } from '@mui/material';

const style = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	bgcolor: 'background.paper',
	boxShadow: 24,
	p: 4,
	'& .MuiTextField-root': { m: 1, width: '25ch' },
};

export const AddButton = ({ headings, props, onAddRow, tableName }) => {
	const [open, setOpen] = React.useState(false);
	const [formData, setFormData] = React.useState({});

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => setOpen(false);

	const handleAddRow = () => {
		onAddRow(formData);
        handleClose();
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevState) => ({ ...prevState, [name]: value }));
	};

	return (
		<>
			<Fab
				color="primary"
				aria-label="add"
				style={{ position: 'fixed', bottom: '25px', right: '25px' }}
				onClick={handleOpen}
			>
				<AddIcon />
			</Fab>
			<Modal
				open={open}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={style}>
					<form>
						<div>
							{headings.map(
								(heading, i) =>
									heading && (
										<TextField
											name={props[i]}
											key={`${tableName}-${heading}`}
											label={heading}
											variant="outlined"
											onChange={handleChange}
										/>
									)
							)}
						</div>
						<div>
							<Button
								style={{
									marginLeft: '7px',
									marginTop: '10px',
									justifySelf: 'self-end',
								}}
								variant="contained"
								onClick={handleAddRow}
							>
								Save
							</Button>
						</div>
					</form>
				</Box>
			</Modal>
		</>
	);
};
