#!/usr/bin/env bash
# Smoke test: run with the server already started on port 3000
B=http://localhost:3000
j='-H Content-Type:application/json'
p() { echo; echo "### $1"; }
p "CREATE user";            curl -s -w ' [%{http_code}]' $j -d '{"name":"Alice","email":"alice@email.com","age":25}' $B/users
p "DUPLICATE email (409)";  curl -s -w ' [%{http_code}]' $j -d '{"name":"Al","email":"alice@email.com","age":30}' $B/users
p "UNDERAGE (400)";         curl -s -w ' [%{http_code}]' $j -d '{"name":"Kid","email":"k@e.com","age":12}' $B/users
p "READ all";               curl -s -w ' [%{http_code}]' $B/users
p "READ one";               curl -s -w ' [%{http_code}]' $B/users/1
p "READ missing (404)";     curl -s -w ' [%{http_code}]' $B/users/999
p "PATCH";                  curl -s -w ' [%{http_code}]' -X PATCH $j -d '{"age":26}' $B/users/1
p "CREATE note";            curl -s -w ' [%{http_code}]' $j -d '{"title":"First","content":"hello"}' $B/users/1/notes
p "NOTE for bad user (404)";curl -s -w ' [%{http_code}]' $j -d '{"title":"x"}' $B/users/999/notes
p "UPDATE note";            curl -s -w ' [%{http_code}]' -X PUT $j -d '{"title":"Edited","content":"changed"}' $B/notes/1
p "LIST notes";             curl -s -w ' [%{http_code}]' $B/users/1/notes
p "SQL INJECTION attempt (rejected by validation; queries are parameterized anyway)"
curl -s -w ' [%{http_code}]' $j -d "{\"name\":\"x\",\"email\":\"' OR 1=1 --\",\"age\":20}" $B/users
p "DELETE user (cascades)"; curl -s -w ' [%{http_code}]' -X DELETE $B/users/1
p "Notes gone after cascade"; curl -s -w ' [%{http_code}]' $B/notes/1
echo
