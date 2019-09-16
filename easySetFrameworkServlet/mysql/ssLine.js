var ssLineSQL = {
    queryAll:"select * from ss_Line",
    insert:"insert into ss_line(linename,x1,y1,x2,y2) VALUES (?,?,?,?,?)",
    delete:"delete from ss_line"
}

module.exports = ssLineSQL;