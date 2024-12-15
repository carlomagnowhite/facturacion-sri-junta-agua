import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BasicAuthGuard implements CanActivate {

  constructor(private configService: ConfigService){}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if(!authHeader){
      throw new Error("Encabezado incorrecto.");
    }

    const [authType, base64Credentials] = authHeader.split(' ');

    if(authType !== 'Basic' || !base64Credentials){
      throw new UnauthorizedException('Credenciales no válidas. Revise el formato e intente de nuevo.');
    }

    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    const realUser = this.configService.get<string>('REAL_USER');
    const realPassword = this.configService.get<string>('REAL_PASSWORD');

    if(username === realUser && password === realPassword){
      return true;
    }else{
      console.log(username + ' ' + password);
      throw new UnauthorizedException("Credenciales incorrectas. Intente de nuevo.");
    }
  }
}
