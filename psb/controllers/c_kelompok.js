var mnu       = 'kelompok';
var mnu2      = 'departemen';
var mnu3      = 'proses';
var dir       = 'models/m_'+mnu+'.php';
var dir2      = '../akademik/models/m_'+mnu2+'.php';
var dir3      = 'models/m_'+mnu3+'.php';
var contentFR = '';

// main function ---
    $(document).ready(function(){
        contentFR += '<form autocomplete="off" onsubmit="simpan();return false;" id="'+mnu+'FR">' 
                        +'<input id="idformH" type="hidden">' 
                        
                        // Departemen
                        +'<label>Departemen</label>'
                        +'<div class="input-control text">'
                            +'<input type="hidden" name="departemenH" id="departemenH">'
                            +'<input disabled type="text" name="departemenTB" id="departemenTB">'
                            +'<button class="btn-clear"></button>'
                        +'</div>'
                        
                        // tahun ajaran 
                        +'<label>Tahun Ajaran</label>'
                        +'<div class="input-control text size3">'
                            +'<input type="hidden" name="tahunajaranH" id="tahunajaranH">'
                            +'<input disabled type="text" name="tahunajaranTB" id="tahunajaranTB">'
                            +'<button class="btn-clear"></button>'
                        +'</div>'
                        
                        // nama kelompok
                        +'<label>Kelompok</label>'
                        +'<div class="input-control text">'
                            +'<input placeholder="Kelompok" oninvalid="this.setCustomValidity(\'Mohon isi dulu\');" required type="text" name="kelompokTB" id="kelompokTB">'
                            +'<button class="btn-clear"></button>'
                        +'</div>'
                        
                        // tgl mulai
                        +'<label>Tanggal Mulai</label>'
                        +'<div class="input-control text size2" data-role="datepicker"'
                            +'data-format="dd mmmm yyyy"'
                            +'data-effect="slide">'
                            +'<input id="tglmulaiTB" name="tglmulaiTB" type="text">'
                            +'<button class="btn-date"></button>'
                        +'</div>'

                        // tgl akhir 
                        +'<label>Tanggal Akhir</label>'
                        +'<div class="input-control text size2" data-role="datepicker"'
                            +'data-format="dd mmmm yyyy"'
                            +'data-effect="slide">'
                            +'<input id="tglakhirTB" name="tglakhirTB" type="text">'
                            +'<button class="btn-date"></button>'
                        +'</div>'

                        // keterangan
                        +'<label>Keterangan</label>'
                        +'<div class="input-control textarea">'
                            +'<textarea placeholder="keterangan" name="keteranganTB" id="keteranganTB"></textarea>'
                        +'</div>'
                        
                        +'<div class="form-actions">' 
                            +'<button class="button primary">simpan</button>&nbsp;'
                            +'<button class="button" type="button" onclick="$.Dialog.close()">Batal</button> '
                        +'</div>'
                    +'</form>';

        // combo departemen
        cmbdepartemen('');
        // cmbdepartemen(false,'');

        //add form
        $("#tambahBC").on('click', function(){
            viewFR();
        });

        //search action
        $('#prosesS').on('change',function (){
            viewTB();
            // cmbproses($('#departemenS').val());
            // alert('p');
        });$('#departemenS').on('change',function(){
            cmbproses($(this).val());
        });
        // $('#kelompokS').keydown(function(e){
        //     if(e.keyCode==13)
        //         viewTB();
        // });
        // $('#tglpendaftaranS').keydown(function(e){
        //     if(e.keyCode==13)
        //         viewTB();
        // });

        // search button
        $('#cariBC').on('click',function(){
            $('#cariTR').toggle('slow');
            $('#kelompokS').val('');
            // $('#tglpendaftaranS').val('');
        });
    }); 
// end of save process ---

// combo departemen ---
    function cmbdepartemen(dep){
        $.ajax({
            url:dir2,
            data:'aksi=cmbdepartemen',
            dataType:'json',
            type:'post',
            success:function(dt){
                var out='';
                if(dt.status!='sukses'){
                    out+='<option value="">'+dt.status+'</option>';
                }else{
                    $.each(dt.departemen, function(id,item){
                        out+='<option value="'+item.replid+'">'+item.nama+'</option>';
                    });
                    $('#departemenS').html(out);
                }cmbproses(dt.departemen[0].replid);
            }
        });
    }
//end of combo departemen ---

// combo tahunajaran ---
    function cmbproses(dep){
        $.ajax({
            url:dir3,
            data:'aksi=cmbproses&departemen='+dep,
            dataType:'json',
            type:'post',
            success:function(dt){
                var out='';
                if(dt.status!='sukses'){
                    out+='<option value="">'+dt.status+'</option>';
                }else{
                    $.each(dt.proses, function(id,item){
                        if(item.aktif=='1'){
                            out+='<option selected="selected" value="'+item.replid+'">'+item.proses+' (aktif)</option>';
                        }else{
                            out+='<option value="'+item.replid+'">'+item.proses+'</option>';
                        }
                    });
                    // viewTB(dep,dt.proses[0].replid); 
                }
                $('#prosesS').html(out);
                // cmbkelompok(dt.proses[0].replid);
                viewTB(); 
            }
        });
    }
//end of combo tahunajaran ---

//save process ---
    function simpan(){
        // var urlx ='&aksi=simpan&departemen='+$('#departemenS').val();
        var urlx ='&aksi=simpan';
        // edit mode
        if($('#idformH').val()!=''){
            urlx += '&replid='+$('#idformH').val();
        }
        $.ajax({
            url:dir,
            cache:false,
            type:'post',
            dataType:'json',
            data:$('form').serialize()+urlx,
            success:function(dt){
                if(dt.status!='sukses'){
                    cont = 'Gagal menyimpan data';
                    clr  = 'red';
                }else{
                    $.Dialog.close();
                    kosongkan();
                    viewTB($('#departemenS').val());
                    cont = 'Berhasil menyimpan data';
                    clr  = 'green';
                }
                notif(cont,clr);
            }
        });
    }
//end of save process ---

// view table ---
    function viewTB(){
        var aksi ='aksi=tampil';
        var cari = '&prosesS='+$('#prosesS').val()
                    // +'&kelompokS='+$('#kelompokS').val()
                     +'&departemenS='+$('#departemenS').val();
        // alert(cari);        
        $.ajax({
            url : dir,
            type: 'post',
            data: aksi+cari,
            beforeSend:function(){
                $('#tbody').html('<tr><td align="center" colspan="7"><img src="../img/w8loader.gif"></td></tr></center>');
            },success:function(dt){
                setTimeout(function(){
                    $('#tbody').html(dt).fadeIn();
                },1000);
            }
        });
    }
// end of view table ---

// form ---
    function viewFR(id){
        $.Dialog({
            shadow: true,
            overlay: true,
            draggable: true,
            width: 500,
            padding: 10,
            onShow: function(){
                var titlex;
                // form :: departemen (disabled field) -----------------------------
                    $.ajax({
                        url:dir2,
                        data:'aksi=cmb'+mnu2+'&replid='+$('#departemenS').val(),
                        type:'post',
                        dataType:'json',
                        success:function(dt){
                            $('#departemenH').val($('#departemenS').val());
                            $('#tahunajaranH').val($('#prosesS').val());
                            var out;
                            if(dt.status!='sukses'){
                                out=dt.status;
                            }else{
                                out=dt.departemen[0].nama;
                            }$('#departemenTB').val(out);
                        // form :: tahun ajaran (disabled field) --------------
                            $.ajax({
                                url:dir3,
                                data:'aksi=cmbproses&departemen='+$('#departemenS').val()+'&replid='+$('#prosesS').val(),
                                dataType:'json',
                                type:'post',
                                success:function(dt2){
                                    var out2;
                                    if(dt.status!='sukses'){
                                        out2=dt2.status;
                                    }else{
                                        out2=dt2.proses[0].proses;
                                    }$('#tahunajaranTB').val(out2);
                                    
                                    if (id!='') { // edit mode
                                    // form :: edit :: tampilkan data 
                                        $.ajax({
                                            url:dir,
                                            data:'aksi=ambiledit&replid='+id,
                                            type:'post',
                                            dataType:'json',
                                            success:function(dt3){
                                                $('#idformH').val(id);
                                                $('#kelompokTB').val(dt3.kelompok);
                                                $('#tglmulaiTB').val(dt3.tglmulai);
                                                $('#tglakhirTB').val(dt3.tglselesai);                                                
                                                $('#keteranganTB').val(dt3.keterangan);
                                            }
                                        });
                                    // end of form :: edit :: tampilkan data 
                                        titlex='<span class="icon-pencil"></span> Ubah ';
                                    }else{ //add mode
                                        titlex='<span class="icon-plus-2"></span> Tambah ';
                                    }
                                }
                            });
                        //end of  form :: tahun ajaran (disabled field) --------------
                        }
                    });
                //end of form :: departemen (disabled field) -----------------------------
                $.Dialog.title(titlex+' '+mnu);
                $.Dialog.content(contentFR);
            }
        });
    }
// end of form ---

    // /paging ---
    function pagination(page,aksix,subaksi){ 
        var aksi ='aksi='+aksix+'&subaksi='+subaksi+'&starting='+page;
        var cari ='';
        var el,el2;

        if(subaksi!=''){ // multi paging 
            el  = '.'+subaksi+'_cari';
            el2 = '#'+subaksi+'_tbody';
        }else{ // single paging
            el  = '.cari';
            el2 = '#tbody';
        }

        $(el).each(function(){
            var p = $(this).attr('id');
            var v = $(this).val();
            cari+='&'+p+'='+v;
        });

        $.ajax({
            url:dir,
            type:"post",
            data: aksi+cari,
            beforeSend:function(){
                $(el2).html('<tr><td align="center" colspan="8"><img src="../img/w8loader.gif"></td></tr></center>');
            },success:function(dt){
                setTimeout(function(){
                    $(el2).html(dt).fadeIn();
                },1000);
            }
        });
    }
//end of paging ---
    
//del process ---
    function del(id){
        if(confirm('melanjutkan untuk menghapus data?'))
        $.ajax({
            url:dir,
            type:'post',
            data:'aksi=hapus&replid='+id,
            dataType:'json',
            success:function(dt){
                var cont,clr;
                if(dt.status!='sukses'){
                    cont = '..Gagal Menghapus '+dt.terhapus+' ..';
                    clr  ='red';
                }else{
                    viewTB($('#departemenS').val());
                    cont = '..Berhasil Menghapus '+dt.terhapus+' ..';
                    clr  ='green';
                }
                notif(cont,clr);
            }
        });
    }
//end of del process ---
    
// notifikasi
function notif(cont,clr) {
    var not = $.Notify({
        caption : "<b>Notifikasi</b>",
        content : cont,
        timeout : 3000,
        style :{
            background: clr,
            color:'white'
        },
    });
}
// end of notifikasi

//reset form ---
    function kosongkan(){
        $('#idformTB').val('');
        $('#kelompokTB').val('');
        $('#tglmulaiTB').val('');
        $('#tglakhirTB').val('');
        $('#biaya_pendaftaranTB').val('');
        // $('#kelompokTB').val('');
        $('#keteranganTB').val('');
    }
//end of reset form ---

//aktifkan process ---
    function aktifkan(id){
    	var th  = $('#'+mnu+'TD_'+id).html();
    	var dep = $('#'+mnu2+'S').val();
    	//alert('d '+dep);
    	//return false;
        if(confirm(' mengaktifkan "'+th+'"" ?'))
        $.ajax({
            url:dir,
            type:'post',
            data:'aksi=aktifkan&replid='+id+'&departemen='+dep,
            dataType:'json',
            success:function(dt){
                var cont,clr;
                if(dt.status!='sukses'){
                    cont = '..Gagal Mengaktifkan '+th+' ..';
                    clr  ='red';
                }else{
                    viewTB($('#departemenS').val());
                    cont = '..Berhasil Mengaktifkan '+th+' ..';
                    clr  ='green';
                }notif(cont,clr);
            }
        });
    }
//end of aktifkan process ---
