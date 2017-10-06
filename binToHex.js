var onesAndZeros = "10001100001001111000100000011111100011101101100101000001110011111000011000000101101011011000001100111001001100111110101011000110"

function getHexString () {

  //console.log(onesAndZeros)
  var str = ''
  for (var i = 0; i < onesAndZeros.length; i = i + 4) {
    str += Bin2Hex(onesAndZeros.substr(i, 4))
  }

  console.log(str)
}

function Bin2Hex (n) {
  if (!checkBin(n)) {
  //  console.log("ByMahee -- Not Binary,from the binToHex.js")
    return 0
  }

  //console.log(parseInt(n, 2).toString(16))
  return parseInt(n, 2).toString(16)
}

function checkBin (n) {
//  return /^[01]{1, 64}$/.test(n)
// ByMahee -- the above statement is being changed to the following as we are checking 4 bits at a time
return /^[01]{1,4}$/.test(n)
}


getHexString()
