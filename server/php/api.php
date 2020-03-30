<?php

class Bbs{
    public $id = 0;
    public $contents = "";
    public $created_at = "";
    public $updated_at = "";
    public $author = "";
    public $url = "";
    
    public static function init($db){
        $db->exec("
        CREATE TABLE IF NOT EXISTS bbs(
            id INTEGER PRIMARY KEY,
            contents TEXT,
            url TEXT,
            author TEXT,
            created_at TIMESTAMP default (datetime(CURRENT_TIMESTAMP,'localtime')),
            updated_at TIMESTAMP default (datetime(CURRENT_TIMESTAMP,'localtime'))
        )
        ");
      }
      public static function insert($db, $text){
        $stmt = $db->prepare("
          INSERT INTO bbs(contents, url) VALUES(?, ?)
        ");
        $stmt->execute([$text, keygen()]);
        $result["status"] = "success";
        $result["text"] = $text;
        return $result;
      }
      public static function findAll($db){
        $stmt = $db->prepare("
          SELECT id, contents, url, created_at, updated_at FROM bbs ORDER by ID DESC
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_CLASS, "bbs");
      }  
      public static function findOne($db, $key){
        $stmt = $db->prepare("
          SELECT id, contents, url, created_at, updated_at FROM bbs WHERE url = :url
        ");
        $stmt->setFetchMode(PDO::FETCH_CLASS, 'bbs');
        $stmt->bindParam(':url', $key, PDO::PARAM_STR);
        $stmt->execute();
        return $stmt->fetch();
      }        
}


function keygen()
{
    $chars = "abcdefghijklmnopqrstuvwxyz";
    $chars .= "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    $chars .= "0123456789";
    while (1) {
        $key = '';
        srand((double) microtime() * 1000000);
        for ($i = 0; $i < 32; $i++) {
            $key .= substr($chars, (rand() % (strlen($chars))), 1);
        }
        break;
    }
    return $key;
}

$db = new PDO('sqlite:./data/hottate.db');
Bbs::init($db);
header('Content-Type: application/json; charset=UTF-8');
function post($db){
  $text = $_POST["text"];
  return Bbs::insert($db, $text);
}
function getAll($db){
    return Bbs::findAll($db);
}
function get($db, $key){
    return Bbs::findOne($db, $key);
}

function getKey($uri){
    $re = '/\/([0-9a-zA-Z]+)$/m';
    preg_match_all($re, $uri, $matches, PREG_SET_ORDER, 0);
    $key = $matches[0][1];
    return $key;
}

function route($key, $method){
    global $db;
    if($_SERVER["REQUEST_METHOD"] == "POST"){
        $text = $_POST["text"];
        return json_encode(post($db));
    }
    if($_SERVER["REQUEST_METHOD"] == "GET"){
        return json_encode(get($db, $key));
    }
}


//Start Here
$key = getKey($_SERVER['REQUEST_URI']);
echo route($key, $_SERVER["REQUEST_METHOD"]);
