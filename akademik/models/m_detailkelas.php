<?php
	session_start();
	require_once '../../lib/dbcon.php';
	require_once '../../lib/func.php';
	require_once '../../lib/pagination_class.php';
	require_once '../../lib/tglindo.php';
	$mnu = 'detailkelas';
	$tb  = 'aka_'.$mnu;

	if(!isset($_POST['aksi'])){
		if(isset($_GET['aksi']) && $_GET['aksi']=='autocomp'){
			$page       = $_GET['page']; // get the requested page
			$limit      = $_GET['rows']; // get how many rows we want to have into the grid
			$sidx       = $_GET['sidx']; // get index row - i.e. user click to sort
			$sord       = $_GET['sord']; // get the direction
			$searchTerm = $_GET['searchTerm'];

			if(!$sidx) 
				$sidx =1;
			if(isset($_GET['subaksi']) && $_GET['subaksi']=='wali'){
				$ss='SELECT
						g.replid,
						k.nama wali,
						k.nip
					FROM
						aka_guru g
						JOIN hrd_karyawan k on k.id = g.karyawan
					WHERE
						'.(isset($_GET['guru']) && $_GET['guru']!=''?'g.replid='.$_GET['guru'].' OR ':'').' (
							k.nama LIKE "%'.$searchTerm.'%" OR 
							k.nip LIKE "%'.$searchTerm.'%" 
						) AND g.replid not in (
							SELECT d.wali
							FROM aka_detailkelas d 
							WHERE d.tahunajaran = '.$_GET['tahunajaran'].' AND d.wali!=0
						)
						';
			}
			// pr($ss);
			$result = mysql_query($ss);
			$row    = mysql_fetch_array($result,MYSQL_ASSOC);
			$count  = mysql_num_rows($result);

			if( $count >0 ) {
				$total_pages = ceil($count/$limit);
			} else {
				$total_pages = 0;
			}
			if ($page > $total_pages) $page=$total_pages;
			$start 	= $limit*$page - $limit; // do not put $limit*($page - 1)
			if($total_pages!=0) {
				$ss.='ORDER BY '.$sidx.' '.$sord.' LIMIT '.$start.','.$limit;
			}else {
				$ss.='ORDER BY '.$sidx.' '.$sord;
			}
			// print_r($ss);exit();
			$result = mysql_query($ss) or die("Couldn t execute query.".mysql_error());
			$rows 	= array();
			while($row = mysql_fetch_assoc($result)) {
				$rows[]= array(
					'replid' =>$row['replid'],
					'wali'   =>$row['wali'],
					'nip'    =>$row['nip']
				);
			}$response=array(
				'page'    =>$page,
				'total'   =>$total_pages,
				'records' =>$count,
				'rows'    =>$rows,
			);$out=json_encode($response);
		}else{
			$out=json_encode(array('status'=>'invalid_no_post'));	
		}		
	}else{
		switch ($_POST['aksi']) {
			// -----------------------------------------------------------------
			case 'tampil':
				$tingkat     = isset($_POST['tingkatS']) && $_POST['tingkatS']!=''?' s.tingkat='.$_POST['tingkatS'].' AND ':'';
				$subtingkat  = isset($_POST['subtingkatS']) && $_POST['subtingkatS']!=''?' k.subtingkat='.$_POST['subtingkatS'].' AND ':'';
				$kelas       = isset($_POST['kelasS'])?filter($_POST['kelasS']):'';
				$nama        = isset($_POST['namaS']) && $_POST['namaS']!=''?' h.nama LIKE"%'.$_POST['namaS'].'%" AND':'';
				$kapasitas   = isset($_POST['kapasitasS']) && $_POST['kapasitasS']!=''?' d.kapasitas LIKE"%'.$_POST['kapasitasS'].'%" AND':'';
				$tahunajaran = isset($_POST['tahunajaranS'])?filter($_POST['tahunajaranS']):'';

				checkDetailKelas($tahunajaran);
				$sql =' SELECT 
							d.replid,
							t.tingkat,
							s.subtingkat,
							k.kelas,
							case d.wali
								when 0 then "-"
								when null then "-"
								else concat(h.nip," / ",h.nama) 
							end as wali,
							case d.kapasitas
								when 0 then "-"
								when null then "-"
								else d.kapasitas 
							end as kapasitas
						FROM aka_kelas k
							LEFT JOIN aka_subtingkat s on s.replid  = k.subtingkat 
							LEFT JOIN aka_tingkat t on t.replid  = s.tingkat 
							LEFT JOIN aka_detailkelas d on d.kelas  = k.replid 
							LEFT JOIN aka_guru g on g.replid  = d.wali 
							LEFT JOIN hrd_karyawan h on h.id  = g.karyawan 
						WHERE
							'.$tingkat.$subtingkat.$kapasitas.'   
							k.kelas LIKE"%'.$kelas.'%" AND
							'.$nama.'
							d.tahunajaran = '.$tahunajaran.' 
						ORDER BY
							t.urutan ASC, 
							s.subtingkat ASC, 
							k.kelas ASC,
							h.nama ASC';
				// pr($sql);
				if(isset($_POST['starting'])){ //nilai awal halaman
					$starting=$_POST['starting'];
				}else{
					$starting=0;
				}

				$recpage= 10;//jumlah data per halaman
				$obj 	= new pagination_class($sql,$starting,$recpage,'tampil','');
				$result =$obj->result;

				#ada data
				$jum	= mysql_num_rows($result);
				$out ='';
				if($jum!=0){	
					$nox 	= $starting+1;
					while($res = mysql_fetch_assoc($result)){	
						$btn ='<td align="center">
									<button data-hint="ubah"  onclick="viewFR('.$res['replid'].');">
										<i class="icon-pencil on-left"></i>
									</button>
								 </td>';
						$out.= '<tr>
									<td>'.$res['tingkat'].'</td>
									<td>'.$res['subtingkat'].'</td>
									<td>'.$res['kelas'].'</td>
									<td>'.$res['wali'].'</td>
									<td>'.$res['kapasitas'].'</td>
									'.$btn.'
								</tr>';
						$nox++;
					}
				}else{ #kosong
					$out.= '<tr align="center">
							<td  colspan=9 ><span style="color:red;text-align:center;">
							... data tidak ditemukan...</span></td></tr>';
				}
				#link paging
				$out.= '<tr class="info"><td colspan=9>'.$obj->anchors.'</td></tr>';
				$out.='<tr class="info"><td colspan=9>'.$obj->total.'</td></tr>';
			break; 
			// view -----------------------------------------------------------------

			// add / edit -----------------------------------------------------------------
			case 'simpan':
				$s = $tb.' set 	kapasitas = "'.filter($_POST['kapasitasTB']).'",
								wali      = "'.filter($_POST['waliH']).'"';
				$s2   = isset($_POST['replid'])?'UPDATE '.$s.' WHERE replid='.$_POST['replid']:'INSERT INTO '.$s;
				$e2   = mysql_query($s2);
				$stat = !$e2?'gagal_'.errMsg(mysql_errno()):'sukses';
				$out  = json_encode(array('status'=>$stat));
			break;
			// add / edit -----------------------------------------------------------------
			
			// delete -----------------------------------------------------------------
			case 'hapus':
				$d    = mysql_fetch_assoc(mysql_query('SELECT * from '.$tb.' where replid='.$_POST['replid']));
				$s    = 'DELETE from '.$tb.' WHERE replid='.$_POST['replid'];
				$e    = mysql_query($s);
				$stat = ($e)?'sukses':'gagal';
				$out  = json_encode(array('status'=>$stat,'terhapus'=>$d[$mnu]));
			break;
			// delete -----------------------------------------------------------------

			// ambiledit -----------------------------------------------------------------
			case 'ambiledit':
				$s 	= ' SELECT 
							ta.tahunajaran
							,t.tingkat   
							,s.subtingkat
							,k.kelas 
							    
							,if(d.kapasitas=0,"",d.kapasitas)kapasitas 
							,if(d.wali=0,"",d.wali)idwali 
							,h.nip
							,h.nama
						FROM  
							aka_detailkelas d 
							LEFT JOIN aka_kelas k on k.replid = d.kelas
							LEFT JOIN aka_guru g on g.replid = d.wali
							LEFT JOIN hrd_karyawan h on h.id = g.karyawan
							LEFT JOIN aka_subtingkat s on s.replid = k.subtingkat 
							LEFT JOIN aka_tingkat t on t.replid = s.tingkat
							LEFT JOIN aka_tahunajaran ta on ta.replid = d.tahunajaran
						WHERE
							d.replid ='.$_POST['replid'];
				// print_r($s);exit();
				$e    = mysql_query($s);
				$r    = mysql_fetch_assoc($e);
				$stat = ($e)?'sukses':'gagal';
				$out  = json_encode(array(
							'status' =>$stat,
							'datax'  =>array(
								'tahunajaran' =>$r['tahunajaran'],
								'tingkat'     =>$r['tingkat'],
								'subtingkat'  =>$r['subtingkat'],
								'kelas'       =>$r['kelas'],
								'kapasitas'   =>$r['kapasitas'],
								'wali'        =>($r['idwali']==0 || $r['idwali']==null?'':$r['nip'].' / '.$r['nama']),
								'idwali'      =>$r['idwali']
						)));
			break;
			// ambiledit -----------------------------------------------------------------

		// cmbkelas ---------------------------------------------------------
			case 'cmbkelas':
				$w='';
				if(isset($_POST['replid'])){
					$w.='where replid ='.$_POST['replid'];
				}else{
					if(isset($_POST[$mnu])){
						$w.='where '.$mnu.'='.$_POST[$mnu];
					}elseif(isset($_POST['subtingkat'])){
						$w.='where subtingkat ='.$_POST['subtingkat'];
					}
				}

				$s	= 'SELECT *
						from '.$tb.'
						'.$w.'		
						ORDER  BY '.$mnu.' asc';
				$e  = mysql_query($s);
				// var_dump($s);
				$n  = mysql_num_rows($e);
				$ar =$dt=array();

				if(!$e){ //error
					$ar = array('status'=>'error');
				}else{
					if($n=0){ // kosong 
						$ar = array('status'=>'kosong');
					}else{ // ada data
						if(!isset($_POST['replid'])){
							while ($r=mysql_fetch_assoc($e)) {
								$dt[]=$r;
							}
						}else{
							$dt[]=mysql_fetch_assoc($e);
						}$ar = array('status'=>'sukses','kelas'=>$dt);
					}
				}
				$out=json_encode($ar);
				// echo $out;
			break;
			// end of cmbkelas ---------------------------------------------------------

		}
	}echo $out;
?>