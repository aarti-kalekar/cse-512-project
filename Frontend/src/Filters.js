import * as React from 'react';
import Slider from '@mui/material/Slider';
import {
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Typography,
	Button,
} from '@mui/material';
import brazilStates from './data/brazilStates.json';

function valuetext(value) {
	return `${value}°C`;
}

export function Filters({ handleFilterChange }) {
	// State for each form field
	const [zipRange, setZipRange] = React.useState([0, 99999]);
	const [state, setState] = React.useState('');
	const [city, setCity] = React.useState('');

	// Handle change for the Slider (Zip Code Prefix)
	const handleSliderChange = (event, newValue) => {
		setZipRange(newValue);
	};

	// Handle change for the Select (State)
	const handleStateChange = (event) => {
		setState(event.target.value);
	};

	// Handle change for the TextField (City)
	const handleCityChange = (event) => {
		setCity(event.target.value);
	};

	// Display the form values when the button is clicked
	const handleDisplayValues = () => {
		// alert(`Zip Code Prefix: ${zipRange}, State: ${state}, City: ${city}`);
		handleFilterChange({
			zipRangeMin: zipRange[0],
			zipRangeMax: zipRange[1],
			city,
			state,
		});
	};

	return (
		<div>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-evenly',
				}}
			>
				<div style={{ width: '200px' }}>
					<Typography id="input-slider">Zip Code Prefix</Typography>
					<Slider
						value={zipRange}
						onChange={handleSliderChange}
						getAriaLabel={() => 'Zip Code Prefix'}
						valueLabelDisplay="auto"
						step={10000}
						marks
						min={0}
						max={99999}
					/>
				</div>
				<div>
					<FormControl style={{ width: '200px' }}>
						<InputLabel id="demo-simple-select-label">State</InputLabel>
						<Select
							value={state}
							labelId="demo-simple-select-label"
							id="demo-simple-select"
							label="State"
							onChange={handleStateChange}
						>
							<MenuItem value="">
								<em>None</em>
							</MenuItem>
							{brazilStates.map((state) => (
								<MenuItem key={state} value={state}>
									{state}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</div>
				<div>
					<TextField
						label="City"
						variant="outlined"
						value={city}
						onChange={handleCityChange}
					/>
				</div>
			</div>
			<div style={{ margin: '20px' }}>
				<Button variant="contained" onClick={handleDisplayValues}>
					Apply
				</Button>
			</div>
		</div>
	);
}
