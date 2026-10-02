using System;
using System.IO;
using System.Reflection;
using System.Windows;
using Microsoft.Win32;

namespace StudyRoomTools {
  public static class Setup {
    const string Key="Software\\Classes\\studyroom-tools",Owner="StudyRoom.Tools.v1";
    static readonly string[] Files={"StudyRoom.Tools.exe","StudyRoom.Tools.exe.config","Iniciar-Herramientas.cmd","Instalar-Herramientas.cmd","Desinstalar-Herramientas.cmd","LEEME.txt","SHA256SUMS.txt"};
    public static int Run(bool install) {
      try {
        var target=Path.GetFullPath(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"StudyRoom","Herramientas"));
        var parent=Path.GetFullPath(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"StudyRoom"))+Path.DirectorySeparatorChar;
        if(!target.StartsWith(parent,StringComparison.OrdinalIgnoreCase))throw new InvalidOperationException("Ruta no válida.");
        using(var existing=Registry.CurrentUser.OpenSubKey(Key)) {
          if(existing!=null&&((string)existing.GetValue("StudyRoomOwner")!=Owner||(string)existing.GetValue("StudyRoomPath")!=target))throw new InvalidOperationException("El protocolo pertenece a otra instalación. No se modificó.");
        }
        var executable=Path.Combine(target,"StudyRoom.Tools.exe");
        if(install) {
          Directory.CreateDirectory(target);
          var source=Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
          foreach(var name in Files){var from=Path.Combine(source,name);var to=Path.Combine(target,name);if(File.Exists(from)&&!String.Equals(from,to,StringComparison.OrdinalIgnoreCase))File.Copy(from,to,true);}
          using(var key=Registry.CurrentUser.CreateSubKey(Key)) {
            key.SetValue("","URL:Herramientas StudyRoom");key.SetValue("URL Protocol","");key.SetValue("StudyRoomOwner",Owner);key.SetValue("StudyRoomPath",target);
            using(var command=key.CreateSubKey("shell\\open\\command"))command.SetValue("","\""+executable+"\" \"%1\"");
          }
          Shortcut(executable,false);
          System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo(executable,"--background"){UseShellExecute=false,CreateNoWindow=true});
          MessageBox.Show("Listo. Las herramientas esperan en segundo plano y aparecerán cuando compartas pantalla en StudyRoom.\n\nNo se añadió inicio automático de Windows ni se pidieron permisos de administrador. Tras reiniciar el PC, abre el acceso directo una vez.\nEl navegador puede solicitar permiso para comunicarse con esta aplicación local.","StudyRoom instalado",MessageBoxButton.OK,MessageBoxImage.Information);
        } else {
          Registry.CurrentUser.DeleteSubKeyTree(Key,false);Shortcut(executable,true);
          bool remaining=false;
          foreach(var name in Files){var file=Path.Combine(target,name);if(File.Exists(file)){try{File.Delete(file);}catch(IOException){remaining=true;}catch(UnauthorizedAccessException){remaining=true;}}}
          MessageBox.Show(remaining?"El protocolo y acceso directo fueron retirados.\nCierra las herramientas y ejecuta Desinstalar-Herramientas.cmd desde la carpeta original del ZIP para retirar los archivos en uso.":"El protocolo, acceso directo y archivos propios fueron retirados. No se modificaron otras aplicaciones.","StudyRoom",MessageBoxButton.OK,MessageBoxImage.Information);
        }
        return 0;
      }catch(Exception error){MessageBox.Show("No se completó la operación. Cierra otra instancia de las herramientas y vuelve a intentarlo.\n\n"+error.Message,"Herramientas StudyRoom",MessageBoxButton.OK,MessageBoxImage.Warning);return 1;}
    }
    static void Shortcut(string executable,bool remove) {
      var path=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory),"Herramientas StudyRoom.lnk");
      try {
        var type=Type.GetTypeFromProgID("WScript.Shell");if(type==null)return;
        var shell=Activator.CreateInstance(type);var shortcut=type.InvokeMember("CreateShortcut",BindingFlags.InvokeMethod,null,shell,new object[]{path});
        var current=(string)shortcut.GetType().InvokeMember("TargetPath",BindingFlags.GetProperty,null,shortcut,null);
        if(File.Exists(path)&&!String.Equals(current,executable,StringComparison.OrdinalIgnoreCase))return;
        if(remove){if(File.Exists(path))File.Delete(path);return;}
        shortcut.GetType().InvokeMember("TargetPath",BindingFlags.SetProperty,null,shortcut,new object[]{executable});
        shortcut.GetType().InvokeMember("WorkingDirectory",BindingFlags.SetProperty,null,shortcut,new object[]{Path.GetDirectoryName(executable)});
        shortcut.GetType().InvokeMember("Save",BindingFlags.InvokeMethod,null,shortcut,null);
      }catch { /* The protocol/portable launcher remains usable if desktop shortcuts are restricted. */ }
    }
  }
}
