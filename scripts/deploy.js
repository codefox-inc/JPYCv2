const { artifacts } = require('hardhat');
const FiatTokenV1 = artifacts.require("FiatTokenV1");
const ERC1967Proxy = artifacts.require("ERC1967Proxy");
const MinterAdmin = artifacts.require("MinterAdmin");
const MultisendToken = artifacts.require("MultisendToken");
const { _data } = require('../test/helpers/DataMaker');
require('dotenv').config()

async function main() {
  const [deployer] = await web3.eth.getAccounts();
  const pauser = process.env.PAUSER;
  const blocklister = process.env.BLOCKLISTER;
  const rescuer = process.env.RESCUER;
  const owner = process.env.OWNER;

  const minterAdmin = await MinterAdmin.new(deployer);
  const multisendToken = await MultisendToken.new();
  const implementation = await FiatTokenV1.new();
  await implementation.initialize(
    'JPY Coin',
    'JPYC',
    'JPY',
    '18',
    minterAdmin.address,
    pauser,
    blocklister,
    rescuer,
    owner
  )
  let proxy = await ERC1967Proxy.new(
    implementation.address,
    _data(minterAdmin.address, pauser, blocklister, rescuer, owner)
  )
  await minterAdmin.setMinterManager(proxy.address);
  await minterAdmin.transferOwnership(owner);
  await multisendToken.transferOwnership(owner);

  proxy = await FiatTokenV1.at(proxy.address)

  const newMinterAdminOwner = await minterAdmin.owner();
  const newMinterAdmin = await proxy.minterAdmin();
  const newPauser = await proxy.pauser();
  const newBlockLister = await proxy.blocklister();
  const newRescuer = await proxy.rescuer();
  const newProxyOwner = await proxy.owner();
  
  console.log(`deployer: ${deployer}`);
  console.log(`minterAdmin contract: ${minterAdmin.address}`);
  console.log(`multisendToken contract: ${multisendToken.address}`);
  console.log(`implementation contract: ${implementation.address}`);
  console.log(`proxy contract: ${proxy.address}`);
  console.log(`proxy minterAdmin: ${newMinterAdmin}`);
  console.log(`proxy pauser: ${newPauser}`);
  console.log(`proxy blocklister: ${newBlockLister}`);
  console.log(`proxy rescuer: ${newRescuer}`);
  console.log(`proxy owner: ${newProxyOwner}`);
  console.log(`minterAdmin owner: ${newMinterAdminOwner}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  });