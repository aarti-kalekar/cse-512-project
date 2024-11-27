import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { camelCaseToTitleCase, titleToCamelCase } from './utils/functions';
import EditableDataGrid from './EditableDataGrid';
import { Filters } from './Filters';
const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
	({ theme }) => ({
		flexGrow: 1,
		padding: theme.spacing(3),
		transition: theme.transitions.create('margin', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
		marginLeft: `-${drawerWidth}px`,
		variants: [
			{
				props: ({ open }) => open,
				style: {
					transition: theme.transitions.create('margin', {
						easing: theme.transitions.easing.easeOut,
						duration: theme.transitions.duration.enteringScreen,
					}),
					marginLeft: 0,
				},
			},
		],
	})
);

const AppBar = styled(MuiAppBar, {
	shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
	transition: theme.transitions.create(['margin', 'width'], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	variants: [
		{
			props: ({ open }) => open,
			style: {
				width: `calc(100% - ${drawerWidth}px)`,
				marginLeft: `${drawerWidth}px`,
				transition: theme.transitions.create(['margin', 'width'], {
					easing: theme.transitions.easing.easeOut,
					duration: theme.transitions.duration.enteringScreen,
				}),
			},
		},
	],
}));

const DrawerHeader = styled('div')(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	padding: theme.spacing(0, 1),
	// necessary for content to be below app bar
	...theme.mixins.toolbar,
	justifyContent: 'flex-end',
}));

export default function MenuAppBar() {
	const getTableData = (d) => {
		const props = Object.keys(d[0]);
		const headings = props.map((prop) => camelCaseToTitleCase(prop));
		headings.push('', '');

		return {
			headings,
			props,
			rows: [...d],
			rowKey: 'id',
		};
	};

	const theme = useTheme();
	const [open, setOpen] = React.useState(false);
	const [tableData, setTableData] = React.useState();
	const [tableName, setTableName] = React.useState('Customers');
	const [totalRecords, setTotalRecords] = React.useState(0);

	React.useEffect(() => {
		const params = {
			zipRangeMin: 0,
			zipRangeMax: 99999,
			city: '',
			state: '',
		};
		fetch(`http://localhost:8000/filter-records?${new URLSearchParams(params)}`)
			.then((response) => response.json())
			.then((d) => {
				setTableData(d.records);
				setTotalRecords(d.count);
			});
	}, [tableName]);

	const handleDrawerOpen = () => {
		setOpen(true);
	};

	const handleDrawerClose = () => {
		setOpen(false);
	};

	const handleTableNameClick = (text) => {
		setTableName(text);
	};

	const handleFilterChange = (params) => {
		fetch(`http://localhost:8000/filter-records?${new URLSearchParams(params)}`)
			.then((response) => response.json())
			.then((d) => {
				setTableData(d.records);
				setTotalRecords(d.count);
			});
	};

	return (
		<Box sx={{ display: 'flex' }}>
			<CssBaseline />
			<AppBar position="fixed" open={open}>
				<Toolbar>
					<IconButton
						color="inherit"
						aria-label="open drawer"
						onClick={handleDrawerOpen}
						edge="start"
						sx={[
							{
								mr: 2,
							},
							open && { display: 'none' },
						]}
					>
						<MenuIcon />
					</IconButton>
					<Typography variant="h6" noWrap component="div">
						E-Commerce Distributed Database System
					</Typography>
				</Toolbar>
			</AppBar>
			<Drawer
				sx={{
					width: drawerWidth,
					flexShrink: 0,
					'& .MuiDrawer-paper': {
						width: drawerWidth,
						boxSizing: 'border-box',
					},
				}}
				variant="persistent"
				anchor="left"
				open={open}
			>
				<DrawerHeader>
					<IconButton onClick={handleDrawerClose}>
						{theme.direction === 'ltr' ? (
							<ChevronLeftIcon />
						) : (
							<ChevronRightIcon />
						)}
					</IconButton>
				</DrawerHeader>
				<Divider />
				<List>
					{['Customers'].map((text) => (
						<ListItem key={text} disablePadding>
							<ListItemButton
								onClick={() => {
									handleTableNameClick(text);
								}}
							>
								<ListItemText primary={text} />
							</ListItemButton>
						</ListItem>
					))}
				</List>
				<Divider />
			</Drawer>
			<Main open={open}>
				<DrawerHeader />
				<Filters handleFilterChange={handleFilterChange} />

				{tableData && (
					<>
						<Typography sx={{ marginBottom: 2 }}>
							Displaying {tableData.length} out of {totalRecords} records. Apply
							filters to refine your search.
						</Typography>
						<EditableDataGrid tableData={tableData} />
					</>
				)}
			</Main>
		</Box>
	);
}
