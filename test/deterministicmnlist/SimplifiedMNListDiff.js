/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

var SimplifiedMNListDiff = require('../../lib/deterministicmnlist/SimplifiedMNListDiff');
var SMNListFixture = require('../fixtures/mnList');
var expect = require('chai').expect;
var sinon = require('sinon');
var Networks = require('../../lib/networks');

var mnListDiffHexString =
  '256b871b6d78a3659545e11576be763efb97a1343937a7d78ebdc1ff0800000070c7a7deb8dae2650c6c867fcb12771f6d54952cb14fa325296fa60ccc020000030000000399b849a70a77784018b41be5abe6e6baa1041d873f32c1c287f9b70303c6d05e33853149ef48201ddbf71c12c2b889e315837faedb3ec0ce21903e4728547919256e3b70dea340b85a3b33ae0188d20ff7c7016bc493b401a380920e9b608992010703000500010000000000000000000000000000000000000000000000000000000000000000ffffffff0502581b0101ffffffff0200694d48010000001976a9144544b54eb482944c315bacfe9b5392ecdc1cd56b88ac801d74ec010000001976a9144544b54eb482944c315bacfe9b5392ecdc1cd56b88ac00000000460200581b000010228246d725173a25631c575a47f33f25973bc749fc61d3fe8f5035f149c6ee545199bcba5e20a8a8d2c8ac39210d6de3e0076e833b2225f15b0625a8738ad9020000000a650e790a074f6e71e270c27d43b9d1cb2513537744d3cd638541c989685e020000650eedb02ef0dd46d5263c72b8e83c932a705a48b7b978b5ae41658c9433010000659f40f8b0272a3ef8bc74f01b3a9f2d8cb90388fba5785e5ef69ceb648601000065f833f4b6f249069ac3f5f9784115b586113af7d6f936a285a574705989010000694228e2454355c39bc167ddfd1c8dae9ef391c4c358d4c053b688d5757700000069f833f4b6f249069ac3f5f9784115b586113af7d6f936a285a5747059890100006b0e790a074f6e71e270c27d43b9d1cb2513537744d3cd638541c989685e0200006b0eedb02ef0dd46d5263c72b8e83c932a705a48b7b978b5ae41658c94330100006b9f40f8b0272a3ef8bc74f01b3a9f2d8cb90388fba5785e5ef69ceb64860100006bf833f4b6f249069ac3f5f9784115b586113af7d6f936a285a5747059890100000afd39010300651a9062a40cc2dde34af8fdccdcb091e957d5804dbc57eb207215e36df60500000cff0f0cff0fb7ce8404327d7e2d51ebcda3ef8b0de5efe3d47d754f345363b4fb3ed1f0f58e0a57e5fdd78b8f540d8e530cc1d9a2950dddc7221af137e9ec65644c01f1c60104ce558e33b2821080691fac2a6034a690a53267f8ce63887ed83924a5b7ff4cc527e9dab4394f794864ea5c940280fe3813f4823a961d2b00bfa14fffa82b7916cebf95a1db362a55430e46cc168a9b3c7f4b956d531b93928044829857058147b96fb3ce4a2ba5101abfe19a56983cab3a6e1deb9e2ecdc2338546d2149809bf8f91639cca400d8dfa73c8f387c11a08000758761486141fe3c7ed5846e6ef15e6a262a6b05030220d5f0b72948d1108b99676a6907db9b7e2e58121a70dd1ea2f6b897d454fe93630fe5825125a13fd39010300652f22c2c0ed659d74d3a3cd234aa2e0ef854c49875514a7559d586d4f1e0400000cff0f0cff0fa56980a7b3cfe15c5f3bbe3fc9ab4f3d73c1cd7da9e8ae537629ebaeb2bac32c90435c5f1258cca230a6c071b5d40897389cbfa08c31efa1155df29fff6c57b2a473f9d146e99ae4fcc097e21421893c96e515a5621917183f8fbbcef6696e01acbf5d4766f067b6809dfb8aaa7a1617102cf1b83acb030fa34ce9b3475c1856057859fd2d76dda81e737d37dcef60ff2f28f0ca586e415b7e62db003fd4ebf32430cb876a3db1f1eda3c1a6599d682e921069ed2cd23e125d984567e7bfd2bd9509c89242eaed8fe832045d789b3b200a9904e5d62ab9c9e6a59067bcf147ed065c8e818abcdf329ef243512de8eebeea0ad234ecca62b1f14b1a2d0022a485d12ea87940af7aac1cddefdec1439999fd3901030065b12d2bd101c3c629859d1990ba2f5a6e1b5d1b01d1805abd71322bf7ca0100000cff0f0cff0f87fc5378cfb956fc0696c091e78fc5113a879fe46818d7f2f690a1cd9b7a6a314ef3958e99f4120d6d6ba1de3d5420ffd7ed6e52266e9f1ecea3657dee4667fdb79ed34fcc71af13baddd13116717602ae6cda610c2d283d61a2a786def53bcf16fc34d6557cb1a8c025a1fe7d5d0a4fac7177054bc00d07860391c7f03e7cae0490af7c663422a95b323161e679a19c35401ae62ddaa0a474ecd95e01125513c0f8361cf68c000459d18e31ebe72ab1838c780da07c11a6076c6459cf020d168191c89e9c5854e23e366f3a884fb5f1c5a6767cd0f5731073dbd920ddefde9614d7dfca0f5dd1cf2d888fee94099b0ef381cc10fb2381c3724837da50e7a3813865f752242c849b4232b391feff5e31fd3901030065f547145bef4d7245728145173abd82530083c426f1ab1b49c427e36d360000000cff0f0cff0f8acfdbcf8deaefb06e03cff275b3807eb81c8c92505b0f48827c6a503471ea75a0a6a37808661d7a4fc028f7a40dda5320684d9670b7129534ce31ebe2923ad4724174f76975aae0f88dca97d8fcb3c1a01f3ec095f8c879b130281f87d3f6f9a2a1691c5c6270c9fad95afa77a2b9bdbfb36683ab4ba406fcdeaff663ade56a0a8373a466c1dc243cfac88c6a89251c7c2602ae5f74c54c5e76eecd63ff1a6a9bee475cbc52a6332775660e43290c48acdcf975a98967eef69cf17ce5f9222f08c50c2e9008c7b4abe99f962c45ccc59ea088f2e2ea66f0236fcbd168d1b3a607a763351a4c60261c6b67bf8b52bcb99a88dff8ae33aa6214773cfc52fa0e8299b051b18d483871599025d92f6a4765fd39010400697fc1936a4507595755d48c39e3daf9146a608e35802416c48a3181d383210000010008ff08ffb0107d065aa3dafcea53b90f7b725e31f948367641c7c6c8b69d7cfad348a3465629975a1c92a3d99fb5a369d3a97d6bba15db82876a91a2a96bcbc75ba61c52dfe33f29885cce4055dd27ae9c55332d9385523156c0acca0b80bdcc01954aa1b98bc748317f29d67b401c19d7a6d4a449e02efce06274cc6c70250008cae8da033d6f63c659d9b2f14dfc5ea97b25a1cca5380ae30d8b6bfa5af5f3511dd0763d2a1d9ab7d7406558be1a37afa2340e91b1c8b0293b63313934374e05e114f7ab7a2ad725dffafca85f0a56ed9f4a1a69af8bd452f5e218b5ec0d1a8094b037184ac54ec66ff6944f3317a09d4c736cefa5685576103e120c0f7c62022af611da3dee4c96e814a90f9bf69255cf2492fd3901040069b12d2bd101c3c629859d1990ba2f5a6e1b5d1b01d1805abd71322bf7ca010000000008ff08ff97b8e0411dd35e02d05675c9d2f996a1675cc9bdeff4ca537fcb8f237d3e5dfad1e9e612ff13c1f7b84e4caaca349fc12d13a726fe7624c8e553c415692861747ba6b779f948c19428997b45115f8f598df857bedab3020c058572e38f9ccd9172c44b3949338ac812eb9167cf9dc349324984f7eb340631cd9fd9564fac7c91100fd679a9977de87998ba814988c3930f043145271c6b6e9b7073b2b81226f30b901cb4f6f720356e54d3bb5960d62db8208c2f150585bbf8f199724afe93253ce9b117a2cf6e838c73303fd8e3034bf779fe1d55e1ae7034e48d97d3c52053153e75d4d4cc72fdfc6829cfa7431849d7e24550b52b15c0ff3efce1eff9deb82c41f59d30707aa07d85f0e3afecd59efd390103006b1a9062a40cc2dde34af8fdccdcb091e957d5804dbc57eb207215e36df60500000cff0f0cff0f80534ec19bee96b84f0dadb28433ee0b44aefd69e6dc8e5124cdd494df15269f62f6fb51b91a5cede7d12d138625776f717f72307471790cb57018bad49cb3557ccf9efd7b233aef0088e08025dec3e9a25223b886c6e4bc7af69c8ec844042216e31ca1d7fbace828f844e53be052165846a75f7e1be96f07e9c4e8db0d165e090c7f39c28da0c4188bd9cf7ff3e777af4647289b24c31288bcb6c56a525845c72cbb31fc0d1e600af89e1f5e8301afa30e5281bfd730db1b36e56efdf2f3b8f18eed1c6f9ac8e1028b99eb1ba20adf1c30046eaedb3b94ba261fcf6166b138150afcd2dd02e48bb7bf756f07a50106f28d0389226e11d749df7871dc0d9f58444e25c5605ccaafcaa671454faa6c9cfd390103006b2f22c2c0ed659d74d3a3cd234aa2e0ef854c49875514a7559d586d4f1e0400000cff0f0cff0f88492096daf2dfe7d48fb346ab406a49833e890dfa60c9025b201848c739f5bbfa75f91d8791e84cddc6479172bc72672641231412080e6cedf10568315514f5f4b0dce002ba4132c67543e73901f31db6f0b8044d99cca1efae8372093029b963905bf467cf6263ce16ca3892c3afd12d90b5029b107ae9c7bc8bae3bf3169003f7e078a096702092b5dafc8bfa9978f23e815d3a9c3daecd2b441ab841111d696e95214d2c1a10885bfe8dfcd0ba9190661336c308e08b239f58eb9e1d5e3152c34adbba0b3eaa5f6ba8ee4f0d35f9631743e12cf08e5751ab91cd8e94723614439a493f5e7abf3344469c9c6e39586d69fab0db4232ceede57d4549484eecdbf4184c9253749a9a7defdea867bf8cfd390103006bb12d2bd101c3c629859d1990ba2f5a6e1b5d1b01d1805abd71322bf7ca0100000cff0f0cff0fa2605b9706e06332f269bc53ea02e7dcb24d47d43c541e079171544012a5eb5dd724dedc32f18b5a8726da4a0c9c22f407d0e311f5c48a7340a80efa581925147bde364f8cb6f25cc437958cdcf8206bb69798eda5c074a0374435567a1c7b70995301c148d4b56a9887edf8cc6b934dcaa89bab01f8b25a382e8f752659e95a034fefd1c5dac4de435e059c2c52ecba21a74107477eab9168e8695e4b56ead98a9748ea3914ae283928b895dddc76dcaf18dbee1ac5c5f5050b050b59e90189cbfcdbf5afcd5d2fe1d20ea04c1710bcf8a4d42c41aa9e2b40d5e3da5998931811e8fe4d97a41f27d146df52deaa589e54d0d386c57fd1e12883a296483a8738bc90e99946b5c76205b0415af805db49fd390103006bf547145bef4d7245728145173abd82530083c426f1ab1b49c427e36d360000000cff0f0cff0fada222a1b00c9653f807ea7b254d225b5f8abf3d0f7e8c84089ae96e74ebae63ab3152622e2cc3b4736d30a51b2d8e8db97821bbbcd2ec08b621b3114a85877aaed1028918cabfb17b90694f5915d9e5a2057983f37f96d94528f68d23f4a137a91ea535b53f0916f83f84a18bdfba8ef5bda7ff6c0e2c5b76c0869ee596f56e0f29da122a3bb2f8c34f8837532148104855cdb3dbbe48274b6f28f3f489e1b5b7c77cdb55e92f40099dad5da7332041900b776c89053defa7c78b8ba8fd1a8111a30cd7a9869e613412c8a748f7e9f6e8ae4a6fe18506013a8cf89f9fa18fb010d96863dcb8b84e23e6cc49d6cc760345bdf3e6dd1bc77c91a9fdca307a3fec57c3fd0d491dd4a74ea6a5a69f50087f';
var mnListDiffJSON = SMNListFixture.getSecondDiff();

describe('SimplifiedMNListDiff', function () {
  describe('constructor', function () {
    it('Should call .fromObject method, if an object is passed as a first arg', function () {
      sinon.spy(SimplifiedMNListDiff, 'fromObject');

      var diff = new SimplifiedMNListDiff(mnListDiffJSON);

      expect(SimplifiedMNListDiff.fromObject.callCount).to.be.equal(1);
      expect(SimplifiedMNListDiff.fromObject.calledWith(mnListDiffJSON)).to.be
        .true;

      SimplifiedMNListDiff.fromObject.restore();
    });
    it('Should call .fromBuffer method, if a buffer is passed as a first arg', function () {
      sinon.spy(SimplifiedMNListDiff, 'fromBuffer');
      var buff = Buffer.from(mnListDiffHexString, 'hex');
      var buff2 = Buffer.from(buff);

      var diff = new SimplifiedMNListDiff(buff);

      expect(SimplifiedMNListDiff.fromBuffer.callCount).to.be.equal(1);
      // expect(SimplifiedMNListDiff.fromBuffer.args[0][0]).to.be.deep.equal(Buffer.from(mnListDiffHexString, 'hex'));
      expect(SimplifiedMNListDiff.fromBuffer.calledWithMatch(buff2)).to.be.true;

      SimplifiedMNListDiff.fromBuffer.restore();
    });
    it('Should call .fromHexString method, if a hex string is passed as a first arg', function () {
      sinon.spy(SimplifiedMNListDiff, 'fromHexString');

      var diff = new SimplifiedMNListDiff(mnListDiffHexString);

      expect(SimplifiedMNListDiff.fromHexString.callCount).to.be.equal(1);
      expect(SimplifiedMNListDiff.fromHexString.calledWith(mnListDiffHexString))
        .to.be.true;

      SimplifiedMNListDiff.fromHexString.restore();
    });
    it('Should call a copy method of passed instance, if instance is passed', function () {
      var instance = new SimplifiedMNListDiff(mnListDiffJSON);
      sinon.spy(instance, 'copy');

      var copy = new SimplifiedMNListDiff(instance);

      expect(instance.copy.callCount).to.be.equal(1);
      copy.baseBlockHash =
        '000002ee5108348a2f59396de29dc5769b2a9bb303d7577aee9cd95136c49b9a';
      expect(instance.baseBlockHash).to.be.not.equal(copy.baseBlockHash);

      instance.copy.restore();
    });
    it('Should throw an error if argument is not a hex string, buffer or object', function () {
      expect(SimplifiedMNListDiff.bind(SimplifiedMNListDiff, 2)).to.throw(
        'Unrecognized argument passed to SimplifiedMNListDiff constructor'
      );
      expect(
        SimplifiedMNListDiff.bind(SimplifiedMNListDiff, 'not a hex string')
      ).to.throw(
        'Unrecognized argument passed to SimplifiedMNListDiff constructor'
      );
      expect(SimplifiedMNListDiff.bind(SimplifiedMNListDiff, true)).to.throw(
        'Unrecognized argument passed to SimplifiedMNListDiff constructor'
      );
    });
  });
  describe('fromObject', function () {
    it('Should be able to create an instance from object', function () {
      var diff = SimplifiedMNListDiff.fromObject(mnListDiffJSON);
      expect(diff.toObject()).to.be.deep.equal(mnListDiffJSON);
    });
    it('Should be able to create an instance from object with specified network', function () {
      var diff = SimplifiedMNListDiff.fromObject(mnListDiffJSON, 'testnet');
      expect(diff.toObject()).to.be.deep.equal(mnListDiffJSON);
    });
  });
  describe('toObject', function () {
    it('Should return an object with serialized diff data', function () {
      var diff = new SimplifiedMNListDiff(mnListDiffJSON);
      expect(diff.toObject()).to.be.deep.equal(mnListDiffJSON);
    });
  });
  describe('fromBuffer', function () {
    it('Should be able to parse a buffer', function () {
      var buf = Buffer.from(mnListDiffHexString, 'hex');
      var smlDiff = new SimplifiedMNListDiff(buf, Networks.testnet);
      var parsed = smlDiff.toObject();
      expect(parsed).to.be.deep.equal(mnListDiffJSON);
    });
  });
  describe('toBuffer', function () {
    it('Should be able to serialize data', function () {
      var buf = new SimplifiedMNListDiff(mnListDiffJSON).toBuffer();
      expect(buf.toString('hex')).to.be.equal(mnListDiffHexString);
    });
  });
  describe('fromHexString', function () {
    it('Should be able to create an instance from a hex string', function () {
      var diff = SimplifiedMNListDiff.fromHexString(
        mnListDiffHexString,
        Networks.testnet
      );
      expect(diff.toObject()).to.be.deep.equal(mnListDiffJSON);
    });
  });
  describe('copy', function () {
    it('Should create a detached copy of an instance', function () {
      var instance = new SimplifiedMNListDiff(mnListDiffJSON);
      var copy = new SimplifiedMNListDiff(instance);

      copy.baseBlockHash =
        '000002ee5108348a2f59396de29dc5769b2a9bb303d7577aee9cd95136c49b9a';
      expect(instance.baseBlockHash).to.be.not.equal(copy.baseBlockHash);
    });
  });
});
