import * as React from 'react';
import { Box, Button, Modal, Typography } from '@mui/material';

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

export const DeleteButton = ({ onHandleDelete, row }) => {
	const [open, setOpen] = React.useState(false);

	const handleOpen = () => {
		setOpen(true);
	};
	
    const handleClose = () => setOpen(false);

    const handleDelete = () => onHandleDelete(row.id);

	return (
		<>
			<Button variant="outlined" onClick={handleOpen}>
				Delete
			</Button>
			<Modal
				open={open}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={style}>
					<div>
						<Typography variant="h6" id="modal-modal-title">
							Are you sure you want to delete this record?
						</Typography>
						<div style={{ textAlign: 'right', paddingTop: '10px' }}>
							<Button
								onClick={handleClose}
								style={{
									marginLeft: '7px',
									marginTop: '10px',
									justifySelf: 'self-end',
								}}
								variant="outlined"
							>
								Cancel
							</Button>
							<Button
								onClick={handleDelete}
								style={{
									marginLeft: '7px',
									marginTop: '10px',
									justifySelf: 'self-end',
								}}
								variant="contained"
							>
								OK
							</Button>
						</div>
					</div>
				</Box>
			</Modal>
		</>
	);
};
