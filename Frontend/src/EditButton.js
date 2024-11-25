import * as React from 'react';
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

export default function EditButton({
	headings,
	props,
	row,
	onHandleSave,
	tableName,
}) {
	const [open, setOpen] = React.useState(false);

	const [formData, setFormData] = React.useState(row);
	
	React.useEffect(() => {
		setFormData(row);
	}, [row]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevState) => ({ ...prevState, [name]: value }));
	};

	const handleOpen = () => {
		setOpen(true);
	};
	const handleClose = () => setOpen(false);

	const handleSave = () => {
		onHandleSave(formData);
		handleClose();
	};

	return (
		<>
			<Button variant="contained" onClick={handleOpen}>
				Edit
			</Button>
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
											key={`${tableName}-${heading}-${row.id}`}
											label={heading}
											variant="outlined"
											defaultValue={row[props[i]]}
											onChange={handleChange}
										/>
									)
							)}
						</div>
						<div>
							<Button
								onClick={handleSave}
								style={{
									marginLeft: '7px',
									marginTop: '10px',
									justifySelf: 'self-end',
								}}
								variant="contained"
							>
								Save
							</Button>
						</div>
					</form>
				</Box>
			</Modal>
		</>
	);
}
