var ssPointSQL = {
    queryAll:"select * from ss_point",
    insert:"insert into ss_point(name,x,y,lineslist) VALUES (?,?,?,?)",
    delete:"delete from ss_point"
}

module.exports = ssPointSQL