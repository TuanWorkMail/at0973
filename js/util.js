/**
 * Created with JetBrains WebStorm.
 * User: AnhTuan
 * Date: 9/26/13
 * Time: 4:00 PM
 * To change this template use File | Settings | File Templates.
 */

//input: interval in which random number come from
//output: random number between interval
function randomNumber(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
}