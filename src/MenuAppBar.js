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

import BasicTable from './BasicTable';
import { camelCaseToTitleCase, titleToCamelCase } from './utils/functions';
import { AddButton } from './AddButton';
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

	React.useEffect(() => {
		const name = titleToCamelCase(tableName);
		fetch(`http://localhost:8000/${name}`)
			.then((response) => response.json())
			.then((d) => {
				setTableData(getTableData(d));
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

	const handleSetRows = (formData) => {
		setTableData({
			...tableData,
			rows: tableData.rows.map((r) => (r.id === formData.id ? formData : r)),
		});
	};
	const handleDeleteRow = (id) => {
		setTableData((d) => ({
			...tableData,
			rows: tableData.rows.filter((r) => r.id !== id),
		}));
	};

	const handleAddRow = (data) => {
		console.log(tableName, data);
		fetch(`http://localhost:8000/${titleToCamelCase(tableName)}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		})
			.then((response) => response.json())
			.then(() => {
				setTableData({
					...tableData,
					rows: [...tableData.rows, data],
				});
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
					{[
						'Customers',
						'Order Items',
						'Order Payments',
						'Order Reviews',
						'Orders',
						'Products',
						'Sellers',
					].map((text) => (
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
				<Typography sx={{ marginBottom: 2 }}>{tableName}</Typography>
				{tableData && (
					<>
						<BasicTable
							{...tableData}
							onSetRows={handleSetRows}
							tableName={titleToCamelCase(tableName)}
							onDeleteRow={handleDeleteRow}
						/>
						<AddButton
							headings={tableData.headings}
							props={tableData.props}
							tableName={tableName}
							onAddRow={handleAddRow}
						/>
					</>
				)}
			</Main>
		</Box>
	);
}
