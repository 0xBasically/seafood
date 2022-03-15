import React, {useState} from 'react';
import {useLocation} from 'react-router-dom';
import useRPCProvider from '../../context/useRpcProvider';
import {SelectedProviderContext} from '../SelectProvider/useSelectedProvider';
import {BlocksContext} from './useBlocks';
import {BiggerThanSmallScreen, SmallScreen} from '../../utils/breakpoints';
import {setupTenderly, TenderlySim} from '../../ethereum/TenderlySim';
import Tabs from './Tabs';
import Simulator from './Simulator';
import Code from './Code';
import './index.css';
import Toolbar from './Toolbar';

export default function Sandbox() {
	const location = useLocation();
	const {defaultProvider} = useRPCProvider();
	const [selectedProvider, setSelectedProvider] = useState(defaultProvider);
	const [blocks, setBlocks] = useState([]);

	function addBlock(block) {
		block.index = blocks.length > 0 
			? blocks[blocks.length - 1].index + 1
			: 0;
		setBlocks(blocks => [...blocks, block]);
	}

	async function simulate() {
		const tenderly = await setupTenderly(selectedProvider.network.chainId);
		const result = await TenderlySim(blocks, tenderly);
		setBlocks(result);
	}

	function removeBlock(index) {
		setBlocks(blocks => {
			return blocks.filter(block => block.index !== index);
		});
	}

	function reset() {
		setBlocks([]);
	}

	return <SelectedProviderContext.Provider value={{selectedProvider, setSelectedProvider}}>
		<BlocksContext.Provider value={{blocks, setBlocks, addBlock, simulate, removeBlock, reset}}>
			<div className={'sandbox'}>
				<BiggerThanSmallScreen>
					<Toolbar></Toolbar>
				</BiggerThanSmallScreen>

				<div className={'content'}>
					<BiggerThanSmallScreen>
						{(location.hash === '' || location.hash === '#add-block' || location.hash === '#events') &&
							<>
								{blocks.length === 0 && 
									<div className={'grow flex items-center justify-center text-2xl'}>
										<div className={'pb-32'}>{'><(((*> - The sandbox is empty'}</div>
									</div>
								}
								{blocks.length > 0 && <Simulator />}
							</>
						}
						{location.hash === '#code' && 
							<Code />}
					</BiggerThanSmallScreen>

					<SmallScreen>
						<Tabs></Tabs>
						{(location.hash === '' || location.hash === '#add-block' || location.hash === '#events') &&
							<Simulator />}
						{location.hash === '#code' && 
							<Code />}
					</SmallScreen>
				</div>
			</div>
		</BlocksContext.Provider>
	</SelectedProviderContext.Provider>;
}