const SimplifiedMNListDiff = require('./lib/deterministicmnlist/SimplifiedMNListDiff');
const SimplifiedMNListStore = require('./lib/deterministicmnlist/SimplifiedMNListStore');

const initialDiffs = [
  {
    "baseBlockHash": "7bbf8f0eb25bfbe1ba934fb78355b18ddf5e92ec26628d0ec62a5ccaf0ad81bd",
    "blockHash": "000001804dd7e2e7c8b7b4796844dd0126352da5463708107e43e285d50dcd94",
    "cbTxMerkleTree": "01000000011e5028f24f2b9f545da6c079041f302905384b48c725eea75c015ddfc2f3a6e10101",
    "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff050266100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac00000000460200661000004e59c41107be1adebabe902107c4aa7c665a9d4adeb5c14e5225eef70baea76d3e356baaa036d9cb2fecb0738a8ec246d46a8135d637ba77f95a1e6c13b05b22",
    "deletedMNs": [],
    "mnList": [
      {
        "proRegTxHash": "3b6c6dcac2a486b84e97634dfc1596182d28352eecb5045e09215e02ba5696c2",
        "confirmedHash": "0000009b5ec493893846d9659f9c5022cd36485a6915537592dea165615d53f4",
        "service": "54.71.116.57:20001",
        "pubKeyOperator": "95ac82bf016ebdbf16c5a5e235abb122b6f0bae5c3f9ae6219724638b8ce911f82312829280dcf842ec29c003bb7c3bb",
        "votingAddress": "yTFWogwHGTfGWmBSXe2qHjHUbt4yitjeki",
        "isValid": true
      },
      {
        "proRegTxHash": "7997a141bcc23c5fe6e130ea4fa58f542d7c7bbeea352ca71cc024829c9d3f46",
        "confirmedHash": "00000007dc70fb8cb2002f0eda7d9c1b083f414f65191c2bb4feaf7481df258c",
        "service": "34.216.104.111:20001",
        "pubKeyOperator": "0cb6157f34acf154c3e65f7d943f1021eb5f3107e16ef55483ad8f6bfa6746fc15f02f4f72b5d85d3b99f5de42e5d3ea",
        "votingAddress": "yYzqyTtcDWdQUDXkXgU6AnFeEPBYtoBmcQ",
        "isValid": true
      },
      {
        "proRegTxHash": "c5e47ee464a4332e5833bcb658f4fcff5e5f557a383d331a346c25a0dc47572a",
        "confirmedHash": "00000060ef6ca50340f30a4e6ec83a6a8ebc16ba13aa5a70768a82b241068805",
        "service": "34.208.8.244:20001",
        "pubKeyOperator": "1367754d6678aba0c7d54e0c9779bbcde2762299d7359ca8fda06ceab790eb30152895dd73fd76c19ff26c2e0f46ec2d",
        "votingAddress": "yUmKcvBe344YBfVEka8addtJnG4x9fcPTm",
        "isValid": true
      },
      {
        "proRegTxHash": "33ae2a95835560137add44a37919deb55204e20b294628c9b0db3aa4bd7b9d4c",
        "confirmedHash": "00000060ef6ca50340f30a4e6ec83a6a8ebc16ba13aa5a70768a82b241068805",
        "service": "35.89.50.0:20001",
        "pubKeyOperator": "955dae3824d2b3d402f6e0330a47fcf007f84158661283dca1afb5d3959501fc38c814bf4b736f025f111abb5d0d1a21",
        "votingAddress": "yNCUsM71HiksRWKaKXMGhRsDnLxETep1bp",
        "isValid": true
      },
      {
        "proRegTxHash": "3e3917f059cb52e511a19063c6f0811a9f7bdf9dfad91c5dcb196eba25f2f9ce",
        "confirmedHash": "00000060ef6ca50340f30a4e6ec83a6a8ebc16ba13aa5a70768a82b241068805",
        "service": "54.200.58.60:20001",
        "pubKeyOperator": "0a8841da9048ac9bc0c98a10270724d99a46d6aff4f2b3d7010ec87cf0d6930ffbb2f0f2fe2b4d7a6aef090655f98683",
        "votingAddress": "yVi8gGfE72cTRdr9DbXDxT3AqiMAN7HDbp",
        "isValid": true
      },
      {
        "proRegTxHash": "7a0f09cfc7b7b071784bfc487f6e6c7edfac13d300446f1123d7d90e6fb57cf4",
        "confirmedHash": "00000060ef6ca50340f30a4e6ec83a6a8ebc16ba13aa5a70768a82b241068805",
        "service": "35.88.233.183:20001",
        "pubKeyOperator": "8b0707bbb656a02a35c366e9547e93af43e3cb4f79110e9c164e454fad41cbf6c29eeebd214cc112efddd1b49d3acab3",
        "votingAddress": "yPDsG76XzkJWW1y1XmP2fvxjXzQ4mxaVq6",
        "isValid": true
      },
      {
        "proRegTxHash": "e4ceb681797e9e92e71a1098c79b50c6af2c49f1a1e025f060cb49473137b798",
        "confirmedHash": "00000060ef6ca50340f30a4e6ec83a6a8ebc16ba13aa5a70768a82b241068805",
        "service": "54.201.190.209:20001",
        "pubKeyOperator": "0250ed2288bc6b4514d9d0aa0756a98d0bb947e61540a69932e54139cd93b148b5cca13ecf353ae9802f4a5eabd4dbae",
        "votingAddress": "yhqikSp2Ar4nrQ7ynGxFtRCh4so8MAorWV",
        "isValid": true
      },
      {
        "proRegTxHash": "1338947149a5dc6a02368b5c33d681a2e90fa4f2d1356d286772baa06fcb7599",
        "confirmedHash": "00000060ef6ca50340f30a4e6ec83a6a8ebc16ba13aa5a70768a82b241068805",
        "service": "34.219.64.215:20001",
        "pubKeyOperator": "0ab6086939f48b93c65b9114f318d88dc62d9df321c4c9b74a40707761bc4d65a9815c10f912e13a9ac8347939e109a5",
        "votingAddress": "yWrHWvXPEsje7wdqVUFnuTm4sGq15A3AgQ",
        "isValid": true
      },
      {
        "proRegTxHash": "bacb15ea3eb858feed40c9759f1da0e88f0c61e2a64c100adeffa9562177309b",
        "confirmedHash": "000000a3e0af0231f0f30d576f84472f94456a77f6365f7c88c2a224801c20b1",
        "service": "54.149.112.22:20001",
        "pubKeyOperator": "8fe26a237920cc36aa4257d7624bdd4bea454acae1bc216a78ae040163ba77dda8fd4aec4b833047168f7cf40c28bd98",
        "votingAddress": "yaS6GbbSE1maRebegsFvqLkNdcFDCr47iT",
        "isValid": true
      },
      {
        "proRegTxHash": "fb258c1363ab98db03de8d5be84d01d9021d8549d135a97595f61fd8239f839c",
        "confirmedHash": "0000009b5ec493893846d9659f9c5022cd36485a6915537592dea165615d53f4",
        "service": "54.202.85.155:20001",
        "pubKeyOperator": "0822be5689c19275b4019d34779979f7dcd51bdbce33d3f50430afc862d04275c2532abb6fe9bdc1eee2ebb8bf48d35a",
        "votingAddress": "yVuQFu5s5nBuRgiq1i3jJsb3V1ss8CamVn",
        "isValid": true
      },
      {
        "proRegTxHash": "53085d9454d5899dafb09fdf2d155c3e90a3b1ddacac689331fcfde2a48d12fe",
        "confirmedHash": "00000060ef6ca50340f30a4e6ec83a6a8ebc16ba13aa5a70768a82b241068805",
        "service": "34.221.11.124:20001",
        "pubKeyOperator": "86ac95a4960f7888197bfc635b240d991e0907bb131e0ce42d73b06359083de09f6cfe705b712740e66cbdc39f3efc9c",
        "votingAddress": "ycBTR2EFsGZs1VZXnuGb8reLPkYHiPyNB8",
        "isValid": true
      },
      {
        "proRegTxHash": "ac89db364d9ae303658a2ae75c19613dbe8373988f98094c3487ceaa74da4007",
        "confirmedHash": "00000060ef6ca50340f30a4e6ec83a6a8ebc16ba13aa5a70768a82b241068805",
        "service": "34.219.255.1:20001",
        "pubKeyOperator": "80c8a9ffbceb61dcdba66b87d9bc27a87ab66e50e91958bc54482a50fabf9b7bf6b45cb735d7e0cadd6ee612d7a27f3d",
        "votingAddress": "yV3NXHRiJ57Ef8Ah4B2wEvopXQaRPciqgy",
        "isValid": true
      },
      {
        "proRegTxHash": "f792434bf432d577a0a7dd021800e9edf825c893740dd2c6c00a6eb3d6699d87",
        "confirmedHash": "00000007dc70fb8cb2002f0eda7d9c1b083f414f65191c2bb4feaf7481df258c",
        "service": "35.166.87.8:20001",
        "pubKeyOperator": "941bda95082cb64c0f1057f49bbd19749cdc8bcea00d956a6692797413c565c7c2904609a75b5de918cfbd18b21c4c3b",
        "votingAddress": "yeJ4W4XVq5PWTn4WaEUbPgMNXa9L2zrrEo",
        "isValid": true
      },
      {
        "proRegTxHash": "4a3e8eab43eabaf26e2cf495f8989580a5beeabecd57c482c9e794a896c7cf68",
        "confirmedHash": "00000060ef6ca50340f30a4e6ec83a6a8ebc16ba13aa5a70768a82b241068805",
        "service": "18.236.88.65:20001",
        "pubKeyOperator": "816b234b50d511eb7ea25b6bc02d64f5ced53b597c4e7b8aef6fb5e8277adb68d60d78dbff7b06d017ec41f0641934a1",
        "votingAddress": "ySB9YDaDqxCZgDYELbeQePsT9J1kPhW4M9",
        "isValid": true
      },
      {
        "proRegTxHash": "70a432bbfb41080162a8f9530d107061518043ff17244cfc15e51d7d96339ba8",
        "confirmedHash": "00000060ef6ca50340f30a4e6ec83a6a8ebc16ba13aa5a70768a82b241068805",
        "service": "34.219.214.178:20001",
        "pubKeyOperator": "0c2258106455f6211b170075756fa987ed2dc81ae5186b878f9f50255550509b3ce1163e5178083bfbb8fd176bdfaad2",
        "votingAddress": "yf4wC7ANFdsnLbGbpogY8rGB1LhEvEJ8WN",
        "isValid": true
      },
      {
        "proRegTxHash": "36d3c17890929e37c1cc863f0ba3f5ba011d5b32828338bd073d241ea5037fe8",
        "confirmedHash": "00000060ef6ca50340f30a4e6ec83a6a8ebc16ba13aa5a70768a82b241068805",
        "service": "34.221.229.206:20001",
        "pubKeyOperator": "92e7164d61599620a8567402b78b0cdf0627552f98f3d9f0f025f572bbd0d9ef9ab9f8fb572676218a3a16a86b183304",
        "votingAddress": "ygGpq1gMVFgFYcAFcaTR39ZUsibaNaZpUp",
        "isValid": true
      },
      {
        "proRegTxHash": "82f2eb6764e7efa93ffebb224ba102b2b85dfe48623de6de0c58a938b53e5c6d",
        "confirmedHash": "00000060ef6ca50340f30a4e6ec83a6a8ebc16ba13aa5a70768a82b241068805",
        "service": "34.220.252.141:20001",
        "pubKeyOperator": "9667bb4bc65be3df6f58a66015836d5bd7be96ea3982120fefeea5fec79451100184616bf145f1d0a5e10bcd6a3463b1",
        "votingAddress": "yVMZF7jFUWZH8BhPYfdi4w6jCXTLaUSwPw",
        "isValid": true
      },
      {
        "proRegTxHash": "07462a37c4728f9ad590d5923f4fde133cdb836e0092d8840ad38441a5fc452d",
        "confirmedHash": "00000060ef6ca50340f30a4e6ec83a6a8ebc16ba13aa5a70768a82b241068805",
        "service": "35.88.213.149:20001",
        "pubKeyOperator": "9026118afa51b41d4bb931531260b8600aad60b2a8d99dd1d1517a891f2d9c024e01eb804acde54d45a72fe7505553db",
        "votingAddress": "yNqFLBT8efYvH8GtoDkPrpwampLnpRYHqA",
        "isValid": true
      },
      {
        "proRegTxHash": "0f1044b8a16373905ef72dae5da54c8d1d3b22e582d2f7a9673085f857dd418d",
        "confirmedHash": "00000060ef6ca50340f30a4e6ec83a6a8ebc16ba13aa5a70768a82b241068805",
        "service": "18.236.163.246:20001",
        "pubKeyOperator": "15d7699996554aa83d26e9d7a46e5ba5521f2a9a42bd1c5e05b4edb7a74b85750050d6a409138a5ec18c33d5f6ffed9b",
        "votingAddress": "yW5BFDv7ng4nhsWfu55kLiqKrT1DxN3BFe",
        "isValid": true
      },
      {
        "proRegTxHash": "0b9210e03f8d000c4bf01848dc329fefdfe0a65a1cd0600fa81985301800d0af",
        "confirmedHash": "00000007dc70fb8cb2002f0eda7d9c1b083f414f65191c2bb4feaf7481df258c",
        "service": "54.212.169.233:20001",
        "pubKeyOperator": "8eda355412f50d5a762644f9cc142f2c6da9a226ae5ec07888ce2dcaef5de1b421a3ccab74e942de55cab78187a9a036",
        "votingAddress": "yN5Wd4Jw38wjh4rQYZA29JDjmq82S2iPEN",
        "isValid": true
      },
      {
        "proRegTxHash": "4f0351121219d28d434dcc3e141ac6e1dfb1fb7b832beee395b83b49e170126f",
        "confirmedHash": "00000007dc70fb8cb2002f0eda7d9c1b083f414f65191c2bb4feaf7481df258c",
        "service": "34.220.121.200:20001",
        "pubKeyOperator": "91450720b0805b4a5bf2e5b55d6653b24dde1b8ef342f346476101dc85367699031d5188fbb06e1054df0fe4bb81c686",
        "votingAddress": "yZ6oq1NxeQRR2hJ59QThBTFT6zK8eSEamj",
        "isValid": true
      },
      {
        "proRegTxHash": "26150a2c37976f95039a391fcffa026491837dbcf32e8d2ab0825d33a7d06baf",
        "confirmedHash": "00000060ef6ca50340f30a4e6ec83a6a8ebc16ba13aa5a70768a82b241068805",
        "service": "34.217.61.222:20001",
        "pubKeyOperator": "90d9178ec83abacf40f1648309a291b803056bd03736d4efbefae27f8c56c078722851a5ec0c68f0c4cf32f600ac8e6d",
        "votingAddress": "ycZkE8oTqozFrUux4b36riX4U7FzFB8VfZ",
        "isValid": true
      },
      {
        "proRegTxHash": "64e8e759d34d1c7753322e11b6b41c00aa82e14534f9595388e0a1c52828f6d0",
        "confirmedHash": "00000060ef6ca50340f30a4e6ec83a6a8ebc16ba13aa5a70768a82b241068805",
        "service": "35.87.37.73:20001",
        "pubKeyOperator": "81f7f7ed1613e2745cc90cc5d92f47df61dabc4e96a3ec4f2d069d4245b8f65e1bb1251397e778b53ae0653717b4d5c0",
        "votingAddress": "yc4Nogum8QWy5u5CVbXUANavMYBGqsn6se",
        "isValid": true
      },
      {
        "proRegTxHash": "81a4e69740db1fbe7d1c59053ef35001425fd3d4862517ce0074bd635ba9b3f0",
        "confirmedHash": "00000029627c50fca216dbcd86bb7f4127d7ddfc7580d17ed83918ee74ae6302",
        "service": "54.201.37.222:20001",
        "pubKeyOperator": "0fcef5ac14326be9966f96eae3cdd62df49b2a4f35b31c0427057bd11b1dc9edd3111d219608334179995147d1333a3f",
        "votingAddress": "ybq1Xfzqp58EjfGay8Pwz7Fw54aDRRnMNa",
        "isValid": true
      },
      {
        "proRegTxHash": "7abfd8fac3b71e5dc049993cb21f4bca96606a584ba161a770a7a13cce5e34d6",
        "confirmedHash": "0000009b5ec493893846d9659f9c5022cd36485a6915537592dea165615d53f4",
        "service": "34.214.38.156:20001",
        "pubKeyOperator": "0cae164b82ad964b297e6ea892472e6c7fa24ec51def83a3814849fdbaaca394530e8c81fd2b9f7e991bc77eb22bb62b",
        "votingAddress": "yPfD97ZZY64c16VkynoR6f9nttCcB4GeGZ",
        "isValid": true
      },
      {
        "proRegTxHash": "6d2688f12342a83db970ac058e08a035e114b9097d6a6d95a5fb1a767269f3b6",
        "confirmedHash": "00000007dc70fb8cb2002f0eda7d9c1b083f414f65191c2bb4feaf7481df258c",
        "service": "34.219.75.199:20001",
        "pubKeyOperator": "0347da6799c5485ee3d06face1b1858bbd5478c54dc56124ffe6ebf6e1dde242dd0d3aa170da565ea103149c9b2df3a7",
        "votingAddress": "yYDSeQuwQJh6h4pWRde5bGHBTQmy9ciPRU",
        "isValid": true
      },
      {
        "proRegTxHash": "d16f76083f02d86d888077708e70ee928deb2df9e5c74352a3336667982380b7",
        "confirmedHash": "00000029627c50fca216dbcd86bb7f4127d7ddfc7580d17ed83918ee74ae6302",
        "service": "35.89.78.105:20001",
        "pubKeyOperator": "07673f04f8c7e921d21ea69de5dd2872f782634346fabf9a208a3e822687236bbc741e1dcf392a6f2035aa8f0a623512",
        "votingAddress": "yS7EUXUihfd6ALnCPPtAhZGFAYAAbH9Suv",
        "isValid": true
      },
      {
        "proRegTxHash": "65778090e921a2bb68c1dd877f8aafbb17d1c4f43200756dcf0790e0537ebe57",
        "confirmedHash": "00000060ef6ca50340f30a4e6ec83a6a8ebc16ba13aa5a70768a82b241068805",
        "service": "54.201.199.64:20001",
        "pubKeyOperator": "8523a1df35eac0b82cf4ea522ef60564dfe86fb93c637442ca9bf4b28a22e2fb97aeffd4ca16f6a65e2b05915dc5058a",
        "votingAddress": "ygUArDdLp5jqQJYSXTWvk7UeH742uzDK2c",
        "isValid": true
      },
      {
        "proRegTxHash": "e8e973e1f5e825e5f24cef61c60789306371e2ba7aa4dd6e73f08cbeb641701f",
        "confirmedHash": "00000060ef6ca50340f30a4e6ec83a6a8ebc16ba13aa5a70768a82b241068805",
        "service": "52.25.246.109:20001",
        "pubKeyOperator": "830e7da33fc26bdb14b6512f487ed9582877a770295ef93206a72ca872f0cd306a597ac0de82ee0abadf5cc2330244b8",
        "votingAddress": "yd7VoMKnKyuxAsSDp5MVNifX14YJbccuxK",
        "isValid": true
      },
      {
        "proRegTxHash": "1c3654113a6f4086beb95b1d4abc82cf6e9baed7f08bfbd47f82a5de9bb58cff",
        "confirmedHash": "00000007dc70fb8cb2002f0eda7d9c1b083f414f65191c2bb4feaf7481df258c",
        "service": "35.161.144.85:20001",
        "pubKeyOperator": "0c799e92b1704041c1902d4727c93d73f10d58ac13012233104546932a5f1f1b7ad7671c43ddeb8b82661592621abbe3",
        "votingAddress": "yUwiDp53etZHYthZzE7wEtzJwfZX61mwrH",
        "isValid": true
      },
      {
        "proRegTxHash": "ce8603bd6e19c883ea8b6f902041b0e386bce23a7dc0028e2f9091bdc42fb37f",
        "confirmedHash": "00000060ef6ca50340f30a4e6ec83a6a8ebc16ba13aa5a70768a82b241068805",
        "service": "54.189.89.146:20001",
        "pubKeyOperator": "874737f55c53cf6c4d72f1aea06d310707cadf0bc9aafa0bd2946f57d853fc079481e57ae9d46d6ca25af62ea659e4a8",
        "votingAddress": "yRoPNDPjHow4RTp6ddSEDX2cmgRJrNT9kd",
        "isValid": true
      }
    ],
    "deletedQuorums": [],
    "newQuorums": [
      {
        "version": 2,
        "llmqType": 101,
        "quorumHash": "000001d58447037b0cd6f70289048797674956c42d9bec879afe4d29457a374e",
        "quorumIndex": 1,
        "signersCount": 9,
        "signers": "ff01",
        "validMembersCount": 9,
        "validMembers": "ff01",
        "quorumPublicKey": "0e03601f96005b3b35b2f6521c1ba5a5a24104367993fda3f08a76b8291ceed12ad00bfb81f98ba5b198587bcc12442d",
        "quorumVvecHash": "7a0df3c4268d22255fff6c7d968eac215cececf79c9e02f0be591897d4abbc99",
        "quorumSig": "98c5b7a24a80b4ef30cc359e11ac3fe0e9ccc21d3a8570e1439d749612555e24dd028d416a5a6db175821895c5f449fa031e915c269a2f3037b6cf4ab30f622d7f148ea08bb578e81629d6b407f87dea037f2af1e8248050666a66e59bfd7f11",
        "membersSig": "93d492fb1e48fcffc948a0304e0fcec19166c3c99b23226b2c6752af74516749f4aec2eef3138d7b1529b3e6f26a190f00c0e89a25d066eefd84c861caff41eabdd8e6b1b6df54fc31a3663d35e9b047f60b9bec6026c57ccf6a84834d9bd5ff"
      },
      {
        "version": 2,
        "llmqType": 101,
        "quorumHash": "0000007ec757dd61eafb9e9c0171d61789ade273c50b7f0f73c1671d34c81860",
        "quorumIndex": 2,
        "signersCount": 9,
        "signers": "ff01",
        "validMembersCount": 9,
        "validMembers": "ff01",
        "quorumPublicKey": "0806465a27eef842c3e2e6ffe4f62a783a411fef5f04b86686de174b2abf6911847c5eed37c3a329b61f8f5d1cade150",
        "quorumVvecHash": "1f017cdb794b64f82f4b065f43f338b0cf15efa13dc41980f5ed079d5214c686",
        "quorumSig": "011b19fee09f1245a1182b07d8024c89a293216f713a33815c8f0492c6d7b76f48d8679e144e0d5e6d5287b7cd6bba0a102832cafa60bbaadb2000ef6fa741b72fc6f3fcbc428a9a9c7080c09196fd8c4aa5471d67a65a901ae180e87ab6e025",
        "membersSig": "00a51aa8227c5cb9c44b0f5a6f8bfe48a6dd8d1ee3222c7e0bc75886802db4b6d339ce894fc9d73808de869b71a47845065a8f2039814957e74d9aee0064e800a16b6e956901f02615cc417b93884410631cbb75cd14a704ffdfde4b8fc00a63"
      },
      {
        "version": 2,
        "llmqType": 101,
        "quorumHash": "000001bf6bdca312c5ec38e946a2f21ab7be157768f1c88bfbb7234fbb217e60",
        "quorumIndex": 0,
        "signersCount": 9,
        "signers": "ff01",
        "validMembersCount": 9,
        "validMembers": "ff01",
        "quorumPublicKey": "0fb4150e4e0496806e1a7daac80a3080230bceff58b1bcfb837278625640dbeb9aecfe9fc42757c5a5432f22423a0aa2",
        "quorumVvecHash": "5662e9fc590029a673136e2a16b4e47291ab0314c3c300bd301ee364b18646fe",
        "quorumSig": "8665401b3e29f31958b60fa3510391986095abd4cfbae61b71919ddbb635b55b5257e129e596a89a398a56977df3673315bf2b2c8a177d027f6e9eaa3baa015b25465f05014b34acbcdbf3997d8b36fab9ef65bc7aac3af126574ed9ddc64a42",
        "membersSig": "80cf310fe8905c7d2aae7b43696b52e3462f3acf8e68c3df999fdeb354d36f461df4d774a817cfc638dec9d8797faba2166e104626007728b871e72c8e2deea50c6cd5815a630f41f6226326c2e22ee0b3c6e8a38a9d14db8cb0abfdb3138747"
      },
      {
        "version": 2,
        "llmqType": 101,
        "quorumHash": "0000007960af85b24af9435dbf589bea1e56df96e401405dd4f892223635d563",
        "quorumIndex": 3,
        "signersCount": 8,
        "signers": "ef01",
        "validMembersCount": 8,
        "validMembers": "ef01",
        "quorumPublicKey": "098800b73f06bf33844ff9ed365e797ac1db74ecd3b9a6f29fe4652a5744ecdae53d7ffdc3b477ca7b3fe4c5c1d53157",
        "quorumVvecHash": "781b1a9960d411067f1287dbd305f6f5aeb74ca7f028240b9d374fc8d6e5fd01",
        "quorumSig": "8af74c5b21615c2acc9849580925e3659b78663ab1c143ca6f594cd6ef7d8b96f98aaabcb23f5c3b363541eb24abcc930ef9822253841370c66f299e2cbcea7f8ea25ffdc6cd8fbb62c0bea8977e3840c42af502c442c7a9800604138999ba22",
        "membersSig": "80f5adfa625d37e86273a20b456de5d456320503491db6e074accf36a99298548cefd41593e5668e6fd3e214de867c4e0b8aacdf2a5fdbb35e60fb1e0cf3d6fbbc16b037d3e61615531d371306a053b2bcb24785b31c00283df05bbb1a3eb36f"
      }
    ],
    "merkleRootMNList": "6da7ae0bf7ee25524ec1b5de4a9d5a667caac4072190bebade1abe0711c4594e",
    "merkleRootQuorums": "225bb0136c1e5af977ba37d635816ad446c28e8a73b0ec2fcbd936a0aa6b353e"
  },
  {
    "baseBlockHash": "000001804dd7e2e7c8b7b4796844dd0126352da5463708107e43e285d50dcd94",
    "blockHash": "000001bcf5407b407b462e2fba1e06d8476ddf3e25a0d3a27e85116a685a6f46",
    "cbTxMerkleTree": "0100000001381d404845284d75fa4bfe0da78ab2024617e00b41852fe33552fdff7a1b08ba0101",
    "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff050267100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac00000000460200671000004e59c41107be1adebabe902107c4aa7c665a9d4adeb5c14e5225eef70baea76d3e356baaa036d9cb2fecb0738a8ec246d46a8135d637ba77f95a1e6c13b05b22",
    "deletedMNs": [],
    "mnList": [],
    "deletedQuorums": [],
    "newQuorums": [],
    "merkleRootMNList": "6da7ae0bf7ee25524ec1b5de4a9d5a667caac4072190bebade1abe0711c4594e",
    "merkleRootQuorums": "225bb0136c1e5af977ba37d635816ad446c28e8a73b0ec2fcbd936a0aa6b353e"
  },
  {
    "baseBlockHash": "000001bcf5407b407b462e2fba1e06d8476ddf3e25a0d3a27e85116a685a6f46",
    "blockHash": "000000062459016314345582a8df077fa57115c7a073b42389889e4c268b7bce",
    "cbTxMerkleTree": "0100000001e119c72f4de61ebbeb3728e562aee74758a51f4daf9a7dfc4f218106c4976ba40101",
    "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff050268100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac00000000460200681000004e59c41107be1adebabe902107c4aa7c665a9d4adeb5c14e5225eef70baea76d3e356baaa036d9cb2fecb0738a8ec246d46a8135d637ba77f95a1e6c13b05b22",
    "deletedMNs": [],
    "mnList": [],
    "deletedQuorums": [],
    "newQuorums": [],
    "merkleRootMNList": "6da7ae0bf7ee25524ec1b5de4a9d5a667caac4072190bebade1abe0711c4594e",
    "merkleRootQuorums": "225bb0136c1e5af977ba37d635816ad446c28e8a73b0ec2fcbd936a0aa6b353e"
  },
  {
    "baseBlockHash": "000000062459016314345582a8df077fa57115c7a073b42389889e4c268b7bce",
    "blockHash": "000000314a156af789874a066086451d722f0faecc98e622a451f0e9e405aee0",
    "cbTxMerkleTree": "0100000001d3d47bd0f84fed6413e6e96298f8eb2c8b0ea10116dd274cb2bcb452ad85a3710101",
    "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff050269100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac00000000460200691000004e59c41107be1adebabe902107c4aa7c665a9d4adeb5c14e5225eef70baea76d3e356baaa036d9cb2fecb0738a8ec246d46a8135d637ba77f95a1e6c13b05b22",
    "deletedMNs": [],
    "mnList": [],
    "deletedQuorums": [],
    "newQuorums": [],
    "merkleRootMNList": "6da7ae0bf7ee25524ec1b5de4a9d5a667caac4072190bebade1abe0711c4594e",
    "merkleRootQuorums": "225bb0136c1e5af977ba37d635816ad446c28e8a73b0ec2fcbd936a0aa6b353e"
  },
  {
    "baseBlockHash": "000000314a156af789874a066086451d722f0faecc98e622a451f0e9e405aee0",
    "blockHash": "0000003b09e0be65b1676359fe8bab2c50fc0d301b51b88083330e90235bbfc5",
    "cbTxMerkleTree": "0100000001aab12cb515dd77b042167218070e38a82e6eff0c37805309657457173dc1f67b0101",
    "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff05026a100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac000000004602006a1000004e59c41107be1adebabe902107c4aa7c665a9d4adeb5c14e5225eef70baea76d3e356baaa036d9cb2fecb0738a8ec246d46a8135d637ba77f95a1e6c13b05b22",
    "deletedMNs": [],
    "mnList": [],
    "deletedQuorums": [],
    "newQuorums": [],
    "merkleRootMNList": "6da7ae0bf7ee25524ec1b5de4a9d5a667caac4072190bebade1abe0711c4594e",
    "merkleRootQuorums": "225bb0136c1e5af977ba37d635816ad446c28e8a73b0ec2fcbd936a0aa6b353e"
  },
  {
    "baseBlockHash": "0000003b09e0be65b1676359fe8bab2c50fc0d301b51b88083330e90235bbfc5",
    "blockHash": "0000007eb4759d0000145ce0202a3f445334e75d693d5de8aa9804b5584731ce",
    "cbTxMerkleTree": "0100000001aa421e0f96ab94339827ee4aed3d19b8696ed715a453cd3d53118338c14d22f50101",
    "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff05026b100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac000000004602006b1000004e59c41107be1adebabe902107c4aa7c665a9d4adeb5c14e5225eef70baea76d3e356baaa036d9cb2fecb0738a8ec246d46a8135d637ba77f95a1e6c13b05b22",
    "deletedMNs": [],
    "mnList": [],
    "deletedQuorums": [],
    "newQuorums": [],
    "merkleRootMNList": "6da7ae0bf7ee25524ec1b5de4a9d5a667caac4072190bebade1abe0711c4594e",
    "merkleRootQuorums": "225bb0136c1e5af977ba37d635816ad446c28e8a73b0ec2fcbd936a0aa6b353e"
  },
  {
    "baseBlockHash": "0000007eb4759d0000145ce0202a3f445334e75d693d5de8aa9804b5584731ce",
    "blockHash": "00000032796eb27a208e0ce37f844d3334405bf81202091495ad3838b8e90bfc",
    "cbTxMerkleTree": "0100000001e71098168b7829ccd6b791dc4d779c2bd14993ac472c04fc67f2a05610ad013c0101",
    "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff05026c100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac000000004602006c1000004e59c41107be1adebabe902107c4aa7c665a9d4adeb5c14e5225eef70baea76d3e356baaa036d9cb2fecb0738a8ec246d46a8135d637ba77f95a1e6c13b05b22",
    "deletedMNs": [],
    "mnList": [],
    "deletedQuorums": [],
    "newQuorums": [],
    "merkleRootMNList": "6da7ae0bf7ee25524ec1b5de4a9d5a667caac4072190bebade1abe0711c4594e",
    "merkleRootQuorums": "225bb0136c1e5af977ba37d635816ad446c28e8a73b0ec2fcbd936a0aa6b353e"
  },
  {
    "baseBlockHash": "00000032796eb27a208e0ce37f844d3334405bf81202091495ad3838b8e90bfc",
    "blockHash": "000000151ae3dfbbeeae58bacfbf70fc27d9340fd7149b7fa4023d07c42f1a29",
    "cbTxMerkleTree": "01000000012f87dc35ca0ccfd9303a729beec68ef2fe7fa97d6ca8d05878aa4782eec578540101",
    "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff05026d100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac000000004602006d1000004e59c41107be1adebabe902107c4aa7c665a9d4adeb5c14e5225eef70baea76d3e356baaa036d9cb2fecb0738a8ec246d46a8135d637ba77f95a1e6c13b05b22",
    "deletedMNs": [],
    "mnList": [],
    "deletedQuorums": [],
    "newQuorums": [],
    "merkleRootMNList": "6da7ae0bf7ee25524ec1b5de4a9d5a667caac4072190bebade1abe0711c4594e",
    "merkleRootQuorums": "225bb0136c1e5af977ba37d635816ad446c28e8a73b0ec2fcbd936a0aa6b353e"
  },
  {
    "baseBlockHash": "000000151ae3dfbbeeae58bacfbf70fc27d9340fd7149b7fa4023d07c42f1a29",
    "blockHash": "000001fb48ed287b8b4aebcdb87833fcd3cf0952a6031152d36c3e9bdbb7840e",
    "cbTxMerkleTree": "0100000001b804aabce7fda9d9a60e1684d91c8a2e61b7ebbe2bfaceeae70b0efb0bbfddd00101",
    "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff05026e100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac000000004602006e1000004e59c41107be1adebabe902107c4aa7c665a9d4adeb5c14e5225eef70baea76d3e356baaa036d9cb2fecb0738a8ec246d46a8135d637ba77f95a1e6c13b05b22",
    "deletedMNs": [],
    "mnList": [],
    "deletedQuorums": [],
    "newQuorums": [],
    "merkleRootMNList": "6da7ae0bf7ee25524ec1b5de4a9d5a667caac4072190bebade1abe0711c4594e",
    "merkleRootQuorums": "225bb0136c1e5af977ba37d635816ad446c28e8a73b0ec2fcbd936a0aa6b353e"
  },
  {
    "baseBlockHash": "000001fb48ed287b8b4aebcdb87833fcd3cf0952a6031152d36c3e9bdbb7840e",
    "blockHash": "000001feab175ebec07709c29ae9c47a4ce58bd02a504f2b402a86bd481100ef",
    "cbTxMerkleTree": "0100000001407ae384e7136fc7d157983173dbfa73b8f8777a3f750b698f6fb649db0c292e0101",
    "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff05026f100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac000000004602006f1000004e59c41107be1adebabe902107c4aa7c665a9d4adeb5c14e5225eef70baea76d3e356baaa036d9cb2fecb0738a8ec246d46a8135d637ba77f95a1e6c13b05b22",
    "deletedMNs": [],
    "mnList": [],
    "deletedQuorums": [],
    "newQuorums": [],
    "merkleRootMNList": "6da7ae0bf7ee25524ec1b5de4a9d5a667caac4072190bebade1abe0711c4594e",
    "merkleRootQuorums": "225bb0136c1e5af977ba37d635816ad446c28e8a73b0ec2fcbd936a0aa6b353e"
  },
  {
    "baseBlockHash": "000001feab175ebec07709c29ae9c47a4ce58bd02a504f2b402a86bd481100ef",
    "blockHash": "00000178713ecc98b1b30fa687c53a9481ba636f0a378e7ca8ce1eb0f0b77e4a",
    "cbTxMerkleTree": "0100000001b12eabecb1327128f633cafdc969bf8fe7d71e569674219742bb9e718c242be90101",
    "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff050270100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac00000000460200701000004e59c41107be1adebabe902107c4aa7c665a9d4adeb5c14e5225eef70baea76d3e356baaa036d9cb2fecb0738a8ec246d46a8135d637ba77f95a1e6c13b05b22",
    "deletedMNs": [],
    "mnList": [],
    "deletedQuorums": [],
    "newQuorums": [],
    "merkleRootMNList": "6da7ae0bf7ee25524ec1b5de4a9d5a667caac4072190bebade1abe0711c4594e",
    "merkleRootQuorums": "225bb0136c1e5af977ba37d635816ad446c28e8a73b0ec2fcbd936a0aa6b353e"
  },
  {
    "baseBlockHash": "00000178713ecc98b1b30fa687c53a9481ba636f0a378e7ca8ce1eb0f0b77e4a",
    "blockHash": "0000003e50864bf6969f717a1508302e83fe47a3c9deb9198a96dcd6f4143190",
    "cbTxMerkleTree": "0100000001ef6c35846f731dc0f003baf57f937c909c9acf65c62376077cb94df10f532f7d0101",
    "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff050271100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac00000000460200711000004e59c41107be1adebabe902107c4aa7c665a9d4adeb5c14e5225eef70baea76d3e356baaa036d9cb2fecb0738a8ec246d46a8135d637ba77f95a1e6c13b05b22",
    "deletedMNs": [],
    "mnList": [],
    "deletedQuorums": [],
    "newQuorums": [],
    "merkleRootMNList": "6da7ae0bf7ee25524ec1b5de4a9d5a667caac4072190bebade1abe0711c4594e",
    "merkleRootQuorums": "225bb0136c1e5af977ba37d635816ad446c28e8a73b0ec2fcbd936a0aa6b353e"
  },
  {
    "baseBlockHash": "0000003e50864bf6969f717a1508302e83fe47a3c9deb9198a96dcd6f4143190",
    "blockHash": "000001dc612601e767fe9f57536bf2b60eb8bbf740e08ac066f8e51284c9689b",
    "cbTxMerkleTree": "020000000220acc05a54af6993cdd94d588ab0962493a8db96b7d75250d3c900dec4b29e54550e9b129715e64b1ef4ba552f96427bdadd322a4b5ff2e55dcf9c7377760f150103",
    "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff050272100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac00000000460200721000004e59c41107be1adebabe902107c4aa7c665a9d4adeb5c14e5225eef70baea76d3e356baaa036d9cb2fecb0738a8ec246d46a8135d637ba77f95a1e6c13b05b22",
    "deletedMNs": [],
    "mnList": [],
    "deletedQuorums": [],
    "newQuorums": [],
    "merkleRootMNList": "6da7ae0bf7ee25524ec1b5de4a9d5a667caac4072190bebade1abe0711c4594e",
    "merkleRootQuorums": "225bb0136c1e5af977ba37d635816ad446c28e8a73b0ec2fcbd936a0aa6b353e"
  },
  {
    "baseBlockHash": "000001dc612601e767fe9f57536bf2b60eb8bbf740e08ac066f8e51284c9689b",
    "blockHash": "000000c5a55abe1c180a52fd330a399c47a83725951023647c3b4833392ea36b",
    "cbTxMerkleTree": "0200000002d873d26dd58cc2bbf0af0a3248c87883a2cef5f36c86336c0961d9ce215d5d9bb2f821152b0fbbe95d9d818d3455c9f9dce1981bcb93ed581312f9eb5d2f0daf0103",
    "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff050273100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac00000000460200731000004e59c41107be1adebabe902107c4aa7c665a9d4adeb5c14e5225eef70baea76d3e356baaa036d9cb2fecb0738a8ec246d46a8135d637ba77f95a1e6c13b05b22",
    "deletedMNs": [],
    "mnList": [],
    "deletedQuorums": [],
    "newQuorums": [],
    "merkleRootMNList": "6da7ae0bf7ee25524ec1b5de4a9d5a667caac4072190bebade1abe0711c4594e",
    "merkleRootQuorums": "225bb0136c1e5af977ba37d635816ad446c28e8a73b0ec2fcbd936a0aa6b353e"
  },
  {
    "baseBlockHash": "000000c5a55abe1c180a52fd330a399c47a83725951023647c3b4833392ea36b",
    "blockHash": "00000017a47603ea0a6074006ebf6f3d22c95996833f26f0c9f53059ea5e0289",
    "cbTxMerkleTree": "02000000021a0d01cddf2d73085c0c71f5190445a0c47a2efc5a93e6b9ddd32d8d8c23f2a5c85bdd531d60f5d68e9ed8492aaf7750307172fe045108a7557714ad4ae2ee7b0103",
    "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff050274100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac00000000460200741000004e59c41107be1adebabe902107c4aa7c665a9d4adeb5c14e5225eef70baea76d3e356baaa036d9cb2fecb0738a8ec246d46a8135d637ba77f95a1e6c13b05b22",
    "deletedMNs": [],
    "mnList": [],
    "deletedQuorums": [],
    "newQuorums": [],
    "merkleRootMNList": "6da7ae0bf7ee25524ec1b5de4a9d5a667caac4072190bebade1abe0711c4594e",
    "merkleRootQuorums": "225bb0136c1e5af977ba37d635816ad446c28e8a73b0ec2fcbd936a0aa6b353e"
  },
  {
    "baseBlockHash": "00000017a47603ea0a6074006ebf6f3d22c95996833f26f0c9f53059ea5e0289",
    "blockHash": "000001c3ea24e07d6deb03ebc32933fe715598b748d43be3e75bcc0bf9354fe1",
    "cbTxMerkleTree": "02000000022317266da38e3b80d5acf7c4cd8a2d2370abda7e0cf78ad0bd5d0548dbdd190a5568d9d2e7505b66ca9bfd439056ebc48d8894bda207508637f89a48bf73d3b90103",
    "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff050275100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac00000000460200751000004e59c41107be1adebabe902107c4aa7c665a9d4adeb5c14e5225eef70baea76d3e356baaa036d9cb2fecb0738a8ec246d46a8135d637ba77f95a1e6c13b05b22",
    "deletedMNs": [],
    "mnList": [],
    "deletedQuorums": [],
    "newQuorums": [],
    "merkleRootMNList": "6da7ae0bf7ee25524ec1b5de4a9d5a667caac4072190bebade1abe0711c4594e",
    "merkleRootQuorums": "225bb0136c1e5af977ba37d635816ad446c28e8a73b0ec2fcbd936a0aa6b353e"
  },
  {
    "baseBlockHash": "000001c3ea24e07d6deb03ebc32933fe715598b748d43be3e75bcc0bf9354fe1",
    "blockHash": "00000050246f99ed2c3a6f4a9239ce1155e5251fc9758ebafb8f794e08f22542",
    "cbTxMerkleTree": "02000000028164c821df138fea01e16950809d0b66345494bb025d356bebfbe18c499a6f81ca291866ff4eb1202765698f1dfc8b58da2e937bcf342f914e67cb3b59d03af70103",
    "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff050276100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac00000000460200761000004e59c41107be1adebabe902107c4aa7c665a9d4adeb5c14e5225eef70baea76d3e356baaa036d9cb2fecb0738a8ec246d46a8135d637ba77f95a1e6c13b05b22",
    "deletedMNs": [],
    "mnList": [],
    "deletedQuorums": [],
    "newQuorums": [],
    "merkleRootMNList": "6da7ae0bf7ee25524ec1b5de4a9d5a667caac4072190bebade1abe0711c4594e",
    "merkleRootQuorums": "225bb0136c1e5af977ba37d635816ad446c28e8a73b0ec2fcbd936a0aa6b353e"
  }
];

const newDiffs =
  [
    {
      "baseBlockHash": "00000050246f99ed2c3a6f4a9239ce1155e5251fc9758ebafb8f794e08f22542",
      "blockHash": "0000009696aa7d9dca966e5a83604707d74518c5120dc3057c8de52dc2b26f7a",
      "cbTxMerkleTree": "0600000004000f13e921dd2d8eedf5a54377857ea1e57a178624a0bb8b43619de26192f7d6874fab265d6a44c3e1640f9f10771b784c7d6dbe980f1feddde3dbf3dc5fe1696aa47e195902aca4cab7ca0d027f322ffff315da5d11eaf5e8639d99f868823037685f0bba539a3dd9e2047ad28a6a67ed0a499923ab230558c74e76f2dd90bb010f",
      "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff050277100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac0000000046020077100000a7e8653f3cce95f67a1c06aec3dd67fcd92c3895f5dddd686e7d4105c56da2283e012b4df7218af8898fb98686fd9929b2fcb4605e4e07343aa0ec0721c8e23e",
      "deletedMNs": [],
      "mnList": [
        {
          "proRegTxHash": "4a3e8eab43eabaf26e2cf495f8989580a5beeabecd57c482c9e794a896c7cf68",
          "confirmedHash": "00000060ef6ca50340f30a4e6ec83a6a8ebc16ba13aa5a70768a82b241068805",
          "service": "18.236.88.65:20001",
          "pubKeyOperator": "816b234b50d511eb7ea25b6bc02d64f5ced53b597c4e7b8aef6fb5e8277adb68d60d78dbff7b06d017ec41f0641934a1",
          "votingAddress": "ySB9YDaDqxCZgDYELbeQePsT9J1kPhW4M9",
          "isValid": false
        }
      ],
      "deletedQuorums": [
        {
          "llmqType": 101,
          "quorumHash": "000001d58447037b0cd6f70289048797674956c42d9bec879afe4d29457a374e"
        },
        {
          "llmqType": 101,
          "quorumHash": "0000007ec757dd61eafb9e9c0171d61789ade273c50b7f0f73c1671d34c81860"
        },
        {
          "llmqType": 101,
          "quorumHash": "000001bf6bdca312c5ec38e946a2f21ab7be157768f1c88bfbb7234fbb217e60"
        },
        {
          "llmqType": 101,
          "quorumHash": "0000007960af85b24af9435dbf589bea1e56df96e401405dd4f892223635d563"
        }
      ],
      "newQuorums": [
        {
          "version": 2,
          "llmqType": 101,
          "quorumHash": "0000003b09e0be65b1676359fe8bab2c50fc0d301b51b88083330e90235bbfc5",
          "quorumIndex": 2,
          "signersCount": 12,
          "signers": "ff0f",
          "validMembersCount": 12,
          "validMembers": "ff0f",
          "quorumPublicKey": "13ac218e3ff650978a9892c68c35be552e40dd5b8a111b77f9924c582c65bc0873bee2f65cb794c5c20411461619967c",
          "quorumVvecHash": "e0877165f924333e7d9513a5829675b64aec36a379f919281c3943013a097bee",
          "quorumSig": "1598a76781c0ab953b58cb8a4a61ed6f956c5e4576b93a008a41ff721e82e46b39feeb983ffaacddae4de8a7157bbca51720766949d3db4acadd57a85e47ecf363924722c3b796e67303a75a9d7f94354af61ab695d9c7b9f4e309e5f15cc55f",
          "membersSig": "065096915025417aa687688cac8698ab697a44e2b5bc0b261a4b89eed79cab8befb1a93498826b66e8fe13c727f4bbfd10e5c7902d3be7be77c20b2d637d99223fa4165aeadb79e58c5e4a6d6c6254fc7bc96eaa53105b74b633116a2cb804d3"
        },
        {
          "version": 2,
          "llmqType": 101,
          "quorumHash": "0000007eb4759d0000145ce0202a3f445334e75d693d5de8aa9804b5584731ce",
          "quorumIndex": 3,
          "signersCount": 12,
          "signers": "ff0f",
          "validMembersCount": 11,
          "validMembers": "ef0f",
          "quorumPublicKey": "899801ca4241a765820b04ccadaa0d6ae13a92ccbc96e08f244c0c92e097422d8c2d0770379f08632e2e9874406611d6",
          "quorumVvecHash": "d72f71c1724a2d9558479c922317da1a89c04b7803a8f4f4df4e173d91924715",
          "quorumSig": "83c711570c1d7cc208b6a3e64436b86f5bd4fb5db3fd6c9c1cafe398f650f2fc51fff25b87795e73f55f01fe1ee8fe0e0c6f6838c6b6a0e0cd54b00256707677b31635ac3406d2da3a4abea9a9c12d15d100392ae59148eb86743d084def50a5",
          "membersSig": "100bb319afaca4a0188344d731f14678fe621057970e11ade9b37bbc0a4fe53c9ced2b07c8b85dc6a23490359cee43e7142042bbfdfe189bb7044650cee015f031f0022e807b419997e4e92c25d8b030bab702a3dabccb421d0f527dcecd7288"
        },
        {
          "version": 2,
          "llmqType": 101,
          "quorumHash": "000000062459016314345582a8df077fa57115c7a073b42389889e4c268b7bce",
          "quorumIndex": 0,
          "signersCount": 12,
          "signers": "ff0f",
          "validMembersCount": 12,
          "validMembers": "ff0f",
          "quorumPublicKey": "90bfc72b79efa6116f5dcf2592fed470ad2fdc58427485827b09bda99fef0d3525c75c87cb69b4144d7b35cf7ca69e55",
          "quorumVvecHash": "2e7a7bf3c3390313d55305779bdef2acb0a7375fb2cd8148206a81132872d963",
          "quorumSig": "07bdb21142d3108e719734745cc3c5ec5be2d2a29872733aa747d301f4931e58d2dce18048a5378831b5177bedbc847a175f5194acff01b146c9625961a3c232c7ae6dc1a64d5f43808d118abf867b3119c64d350cd346e4d3cdf2b675738a9c",
          "membersSig": "8a359f27305eddc6f01abcfbeb4987674852383ee2505aafa11503bb3a478f1eac35bd5cac328a64c5c156f973a228c3009a4c8f9cfafde52ac441988385396e6d2e9c278f5060575e4f30f0c3e94b8b3c07fe8ecb07adde9ce4eb124b0dad42"
        },
        {
          "version": 2,
          "llmqType": 101,
          "quorumHash": "000000314a156af789874a066086451d722f0faecc98e622a451f0e9e405aee0",
          "quorumIndex": 1,
          "signersCount": 12,
          "signers": "ff0f",
          "validMembersCount": 12,
          "validMembers": "ff0f",
          "quorumPublicKey": "8cd7a0ae89fb139a773c0af6a001f50a51fa3b56d466f694a2ecb4c7402dc8e050821f3f8ef84810643bfaccedd4f677",
          "quorumVvecHash": "d7ec963c8f0de6523380fa593408a50bee4a1f2d8266f9782f45591a7eb78a2e",
          "quorumSig": "9628950fd1e8876b30c1a2482808ffe19d925d22f21b9563dbcc1aa4f12228a64d136844e475a1f54b30f859be7354d015974c695b00f4aa18dbc0a4acc1db205f9c9402eea50158313ec2000ebb4ea8e2c21b5b028aafbcd4d8b6ffd1adae48",
          "membersSig": "1110cde263a1f1b1148e6a5b459c171c1e04a1ee473f29cae66ac4bb80204191fd25847d2bb2c27952043eaff5694a490c10ee97d23247540f86fd8aa407a4e28db211a8a8ca875415e0a3008e7e2b152cfdfd885bcb24c87e8805acf5c234ee"
        }
      ],
      "merkleRootMNList": "28a26dc505417d6e68ddddf595382cd9fc67ddc3ae061c7af695ce3c3f65e8a7",
      "merkleRootQuorums": "3ee2c82107eca03a34074e5e60b4fcb22999fd8686b98f89f88a21f74d2b013e"
    },
    {
      "baseBlockHash": "0000009696aa7d9dca966e5a83604707d74518c5120dc3057c8de52dc2b26f7a",
      "blockHash": "000001cdcb0e5c6bd44b3eb9517fa1782999d7e8c0831ae6f4284f3ccd8d6fa8",
      "cbTxMerkleTree": "020000000271710f7c542f4c9a52f9939d45497283c449e9e668257126453fd4075f46301ce0b1dbe135442ee059cdeb099ebab76361cd469c7e822c7cf45ec5e0f4702ebc0103",
      "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff050278100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac0000000046020078100000a7e8653f3cce95f67a1c06aec3dd67fcd92c3895f5dddd686e7d4105c56da228ac829f5de6f5da55df1728ac790210f74afc15942398aebc11f2d0c70b778122",
      "deletedMNs": [],
      "mnList": [],
      "deletedQuorums": [],
      "newQuorums": [],
      "merkleRootMNList": "28a26dc505417d6e68ddddf595382cd9fc67ddc3ae061c7af695ce3c3f65e8a7",
      "merkleRootQuorums": "2281770bc7d0f211bcae98239415fc4af7100279ac2817df55daf5e65d9f82ac"
    },
    {
      "baseBlockHash": "000001cdcb0e5c6bd44b3eb9517fa1782999d7e8c0831ae6f4284f3ccd8d6fa8",
      "blockHash": "0000009717a2c39ab47f2774e48f9db6a92399163880e846c672cf5f50b3263f",
      "cbTxMerkleTree": "0200000002d5cfeed03a4ed26064065cde3c3fbaef5c8422b8c8be9677de2b7024b341f49943aeb229eb344268799bfec49a1a0605b11408537ed8f16e0aead555269121460103",
      "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff050279100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac0000000046020079100000a7e8653f3cce95f67a1c06aec3dd67fcd92c3895f5dddd686e7d4105c56da228ac829f5de6f5da55df1728ac790210f74afc15942398aebc11f2d0c70b778122",
      "deletedMNs": [],
      "mnList": [],
      "deletedQuorums": [],
      "newQuorums": [],
      "merkleRootMNList": "28a26dc505417d6e68ddddf595382cd9fc67ddc3ae061c7af695ce3c3f65e8a7",
      "merkleRootQuorums": "2281770bc7d0f211bcae98239415fc4af7100279ac2817df55daf5e65d9f82ac"
    },
    {
      "baseBlockHash": "0000009717a2c39ab47f2774e48f9db6a92399163880e846c672cf5f50b3263f",
      "blockHash": "0000017b20f5edea45f62303d435be5a2f9a28f8d1d7680a3523a7dd33205e5b",
      "cbTxMerkleTree": "0200000002d90ddfce2de23f340d622195eab1ab5d5425ecb53bbe9951d89023f360f340dd271911b07a155ce3f856f20f3f2ab8d3ac41e0ed130ba102c2623a7f291ad6a30103",
      "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff05027a100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac000000004602007a100000a7e8653f3cce95f67a1c06aec3dd67fcd92c3895f5dddd686e7d4105c56da228ac829f5de6f5da55df1728ac790210f74afc15942398aebc11f2d0c70b778122",
      "deletedMNs": [],
      "mnList": [],
      "deletedQuorums": [],
      "newQuorums": [],
      "merkleRootMNList": "28a26dc505417d6e68ddddf595382cd9fc67ddc3ae061c7af695ce3c3f65e8a7",
      "merkleRootQuorums": "2281770bc7d0f211bcae98239415fc4af7100279ac2817df55daf5e65d9f82ac"
    },
    {
      "baseBlockHash": "0000017b20f5edea45f62303d435be5a2f9a28f8d1d7680a3523a7dd33205e5b",
      "blockHash": "00000138950fa69ab5d5e100a0097b4121ab3ac236cf474902da54abfd0f6c84",
      "cbTxMerkleTree": "010000000174415f67a163bc8f77f32b9d23252f325071905b2094bb462b74cd50aa6bd0520101",
      "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff05027b100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac000000004602007b100000a7e8653f3cce95f67a1c06aec3dd67fcd92c3895f5dddd686e7d4105c56da228ac829f5de6f5da55df1728ac790210f74afc15942398aebc11f2d0c70b778122",
      "deletedMNs": [],
      "mnList": [],
      "deletedQuorums": [],
      "newQuorums": [],
      "merkleRootMNList": "28a26dc505417d6e68ddddf595382cd9fc67ddc3ae061c7af695ce3c3f65e8a7",
      "merkleRootQuorums": "2281770bc7d0f211bcae98239415fc4af7100279ac2817df55daf5e65d9f82ac"
    },
    {
      "baseBlockHash": "00000138950fa69ab5d5e100a0097b4121ab3ac236cf474902da54abfd0f6c84",
      "blockHash": "0000001b555d14d7d721820fcbe4152c35a454bae42e752860b2dbef96d2e4eb",
      "cbTxMerkleTree": "0100000001ec0ac31e1808b5b6bd7e1b6b31dfc017ac7e7ef322c80a33f7b0122daa2bee680101",
      "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff05027c100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac000000004602007c100000a7e8653f3cce95f67a1c06aec3dd67fcd92c3895f5dddd686e7d4105c56da228ac829f5de6f5da55df1728ac790210f74afc15942398aebc11f2d0c70b778122",
      "deletedMNs": [],
      "mnList": [],
      "deletedQuorums": [],
      "newQuorums": [],
      "merkleRootMNList": "28a26dc505417d6e68ddddf595382cd9fc67ddc3ae061c7af695ce3c3f65e8a7",
      "merkleRootQuorums": "2281770bc7d0f211bcae98239415fc4af7100279ac2817df55daf5e65d9f82ac"
    },
    {
      "baseBlockHash": "0000001b555d14d7d721820fcbe4152c35a454bae42e752860b2dbef96d2e4eb",
      "blockHash": "0000010bc9751d312f0db81648668f2e0aa3bcb9c0a47ef6029751dd38cf7caa",
      "cbTxMerkleTree": "0100000001c7a86bc57669f96817745d403d5a497c74ce568bc96106ac77757989b8378ce00101",
      "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff05027d100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac000000004602007d100000a7e8653f3cce95f67a1c06aec3dd67fcd92c3895f5dddd686e7d4105c56da228ac829f5de6f5da55df1728ac790210f74afc15942398aebc11f2d0c70b778122",
      "deletedMNs": [],
      "mnList": [],
      "deletedQuorums": [],
      "newQuorums": [],
      "merkleRootMNList": "28a26dc505417d6e68ddddf595382cd9fc67ddc3ae061c7af695ce3c3f65e8a7",
      "merkleRootQuorums": "2281770bc7d0f211bcae98239415fc4af7100279ac2817df55daf5e65d9f82ac"
    },
    {
      "baseBlockHash": "0000010bc9751d312f0db81648668f2e0aa3bcb9c0a47ef6029751dd38cf7caa",
      "blockHash": "0000015c6a83514e371c8c96db2fe2d8b9a8f9d00adb2743d9515db27dbdc71d",
      "cbTxMerkleTree": "010000000150296f154ddb117403795d9f044e99d29a4d6f3a3a67179c4938183d7384a8bb0101",
      "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff05027e100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac000000004602007e100000a7e8653f3cce95f67a1c06aec3dd67fcd92c3895f5dddd686e7d4105c56da228ac829f5de6f5da55df1728ac790210f74afc15942398aebc11f2d0c70b778122",
      "deletedMNs": [],
      "mnList": [],
      "deletedQuorums": [],
      "newQuorums": [],
      "merkleRootMNList": "28a26dc505417d6e68ddddf595382cd9fc67ddc3ae061c7af695ce3c3f65e8a7",
      "merkleRootQuorums": "2281770bc7d0f211bcae98239415fc4af7100279ac2817df55daf5e65d9f82ac"
    },
    {
      "baseBlockHash": "0000015c6a83514e371c8c96db2fe2d8b9a8f9d00adb2743d9515db27dbdc71d",
      "blockHash": "000001835ef76b55091e281b5f81987ae0f72871d0d5f79674fa5da0596c5004",
      "cbTxMerkleTree": "0100000001c1cff913d239a83055a0f1412f1b61bcdc94017723f349a7ff8c1004813844a80101",
      "cbTx": "03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff05027f100101ffffffff020034e230040000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac004e5349060000001976a914a0a306909165ad24616e77b012c820c197a61f4088ac000000004602007f100000a7e8653f3cce95f67a1c06aec3dd67fcd92c3895f5dddd686e7d4105c56da228ac829f5de6f5da55df1728ac790210f74afc15942398aebc11f2d0c70b778122",
      "deletedMNs": [],
      "mnList": [],
      "deletedQuorums": [],
      "newQuorums": [],
      "merkleRootMNList": "28a26dc505417d6e68ddddf595382cd9fc67ddc3ae061c7af695ce3c3f65e8a7",
      "merkleRootQuorums": "2281770bc7d0f211bcae98239415fc4af7100279ac2817df55daf5e65d9f82ac"
    }
  ];

const network = 'testnet';

const store = new SimplifiedMNListStore(initialDiffs.map((item) => new SimplifiedMNListDiff(item, network), { smlMaxListsLimit: 16 }));

newDiffs.forEach((diff) => {
  store.addDiff(new SimplifiedMNListDiff(diff, network));
})
